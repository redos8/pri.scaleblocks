'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Scale blocks depends of conditions
 * @author Yuriy Petrov at Haymarket Media
 */

var ScaleBlocks = function () {
  function ScaleBlocks() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, ScaleBlocks);

    this.dataAttrName = options.dataAttrName || 'scale-if';
    this.dataAttrParent = options.dataAttrParent || 'scale-parent';
    this.dataAttrCoef = options.dataAttrCoef || 'scale-coef';

    this.init();
  }

  _createClass(ScaleBlocks, [{
    key: 'init',
    value: function init() {
      this.compileConditions();

      $(window).on('resize.ScaleBlocks', this.update.bind(this)).trigger('resize');
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      $(window).off('resize.ScaleBlocks');
    }
  }, {
    key: 'tokenizer',
    value: function tokenizer(raw) {
      var tokens = ['window.width', 'window.height'];
      var replaces = ['innerWidth', 'innerHeight'];

      var data = raw.match(/([A-z\.]+)\s+([\<\=|\>\=|\>|\<]{1,2})\s+([0-9]+)/);

      var rVar = data[1];
      var cond = data[2];
      var value = data[3] | 0;

      return function (aVar, aCond, aValue) {
        var cVar = window[replaces[tokens.indexOf(aVar)]];
        var triggered = false;
        var direction = -1;

        switch (aCond) {
          case '>':
            triggered = cVar > aValue;
            triggered && (direction = 1);
            break;
          case '<':
            triggered = cVar < aValue;
            triggered && (direction = -1);
            break;
          case '<=':
            triggered = cVar <= aValue;
            triggered && (direction = -1);
            break;
          case '>=':
            triggered = cVar >= aValue;
            triggered && (direction = 1);
            break;
        }
        return { triggered: triggered, direction: -1, value: cVar, default: aValue };
      }.bind(this, rVar, cond, value);
    }
  }, {
    key: 'compileConditions',
    value: function compileConditions() {
      var _this = this;

      $('[data-' + this.dataAttrName + ']').each(function (i, itemBlock) {
        $(itemBlock).wrap('<div class="scale-block-item"></div>');

        var item = $(itemBlock).parent()[0];
        var attrIf = $(itemBlock).data(_this.dataAttrName);
        var attrCoef = $(itemBlock).data(_this.dataAttrCoef) || 1;

        $(item).data('height', $(itemBlock).height()).data('width', $(itemBlock).width());

        var condition = _this.tokenizer(attrIf);
        $(itemBlock).data('scale-func', function (condition, aCoef, item) {
          var value = condition();
          if (value.triggered) {
            var scale = this.scale(value) * aCoef;
            var height = $(item).data('height') * scale;
            // $(item).removeAttr('style');
            $(item).css({ height: height, 'transform': 'scale(' + scale + ')' });
            $(item).css('transform-origin', 'top left');
            $(itemBlock).data('scale', scale);
          }
        }.bind(_this, condition, attrCoef, item));
      });
    }
  }, {
    key: 'scale',
    value: function scale(obj) {
      return obj.value / obj.default;
    }
  }, {
    key: 'update',
    value: function update() {
      $('[data-' + this.dataAttrName + ']').each(function (i, item) {
        return $(item).data('scale-func')();
      });
    }
  }]);

  return ScaleBlocks;
}();

$(function () {
  if (!window.disableAutoScaleBlocks) {
    new ScaleBlocks();
  }
});
