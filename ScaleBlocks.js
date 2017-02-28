/**
 * Scale blocks depends of conditions
 * @author Yuriy Petrov at Haymarket Media
 */

class ScaleBlocks {
  constructor(options = {}) {
    this.dataAttrName = options.dataAttrName || 'scale-if';
    this.dataAttrParent = options.dataAttrParent || 'scale-parent';
    this.dataAttrCoef = options.dataAttrCoef || 'scale-coef';

    this.init();
  }
  init() {
    this.compileConditions();

    $(window).on('resize.ScaleBlocks', this.update.bind(this)).trigger('resize');
  }
  destroy() {
    $(window).off('resize.ScaleBlocks');
  }
  tokenizer(raw) {
    let tokens = ['window.width', 'window.height'];
    let replaces = ['innerWidth', 'innerHeight'];

    let data = raw.match(/([A-z\.]+)\s+([\<\=|\>\=|\>|\<]{1,2})\s+([0-9]+)/);

    let rVar = data[1];
    let cond = data[2];
    let value = data[3] | 0;

    return function(aVar, aCond, aValue) {
      let cVar = window[replaces[tokens.indexOf(aVar)]];
      let triggered = false;
      let direction = -1;

      switch(aCond) {
        case '>':
          triggered = (cVar > aValue);
          triggered && (direction = 1);
          break;
        case '<':
          triggered = (cVar < aValue);
          triggered && (direction = -1);
          break;
        case '<=':
          triggered = (cVar <= aValue);
          triggered && (direction = -1);
          break;
        case '>=':
          triggered = (cVar >= aValue);
          triggered && (direction = 1);
          break;
      }
      return {triggered: triggered, direction: -1, value: cVar, default: aValue};
    }.bind(this, rVar, cond, value);
  }
  compileConditions() {
    $('[data-'+this.dataAttrName+']').each((i, itemBlock) => {
      $(itemBlock).wrap('<div class="scale-block-item"></div>');

      let item = $(itemBlock).parent()[0];
      let attrIf = $(itemBlock).data(this.dataAttrName);
      let attrCoef = $(itemBlock).data(this.dataAttrCoef) || 1;

      $(item).data('height', $(itemBlock).height()).data('width', $(itemBlock).width());

      let condition = this.tokenizer(attrIf);
      $(itemBlock).data('scale-func',
        function (condition, aCoef, item) {
          let value = condition();
          if(value.triggered) {
            let scale = this.scale(value) * aCoef;
            let height = $(item).data('height') * scale;
            // $(item).removeAttr('style');
            $(item).css({height: height, 'transform': `scale(${scale})`});
            $(item).css('transform-origin', 'top left');
            $(itemBlock).data('scale', scale);
          }
        }.bind(this, condition, attrCoef, item)
      );
    });
  }
  scale(obj) {
    return obj.value / obj.default;
  }
  update() {
    $('[data-'+this.dataAttrName+']').each((i, item) => $(item).data('scale-func')());
  }
}
$(() => {
  if(!window.disableAutoScaleBlocks) {
    new ScaleBlocks();
  }
});

