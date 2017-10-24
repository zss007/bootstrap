/* ========================================================================
 * Bootstrap: popover.js v3.3.7(弹出框)
 * http://getbootstrap.com/javascript/#popovers
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */
+function ($) {
  'use strict';

  // POPOVER PUBLIC CLASS DEFINITION
  // ===============================
  var Popover = function (element, options) {
    this.init('popover', element, options)
  }

  if (!$.fn.tooltip) throw new Error('Popover requires tooltip.js')

  Popover.VERSION  = '3.3.7'
  Popover.DEFAULTS = $.extend({}, $.fn.tooltip.Constructor.DEFAULTS, {
    placement: 'right',
    trigger: 'click',
    content: '',
    template: '<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'
  })

  // NOTE: POPOVER EXTENDS tooltip.js(popover拓展tooltip，覆盖掉几个不同的表现方法就好了)
  // ================================
  Popover.prototype = $.extend({}, $.fn.tooltip.Constructor.prototype)
  Popover.prototype.constructor = Popover

  // 获取默认设置
  Popover.prototype.getDefaults = function () {
    return Popover.DEFAULTS
  }

  // 设置提示框
  Popover.prototype.setContent = function () {
    var $tip    = this.tip()
    var title   = this.getTitle()
    var content = this.getContent()

    // 设置提示框标题
    $tip.find('.popover-title')[this.options.html ? 'html' : 'text'](title)
    // 设置提示框内容
    $tip.find('.popover-content').children().detach().end()[ // we use append for html objects to maintain js events
      this.options.html ? (typeof content == 'string' ? 'html' : 'append') : 'text'
    ](content)

    $tip.removeClass('fade top bottom left right in')

    // IE8 doesn't accept hiding via the `:empty` pseudo selector, we have to do
    // this manually by checking the contents.
    if (!$tip.find('.popover-title').html()) $tip.find('.popover-title').hide()
  }

  // 是否有显示内容(有标题或者内容)
  Popover.prototype.hasContent = function () {
    return this.getTitle() || this.getContent()
  }

  // 获取提示框内容
  Popover.prototype.getContent = function () {
    var $e = this.$element
    var o  = this.options

    return $e.attr('data-content')
      || (typeof o.content == 'function' ?
            o.content.call($e[0]) :
            o.content)
  }

  // 获取提示箭头(arrow类)
  Popover.prototype.arrow = function () {
    return (this.$arrow = this.$arrow || this.tip().find('.arrow'))
  }

  // POPOVER PLUGIN DEFINITION
  // =========================
  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.popover')
      var options = typeof option == 'object' && option

      if (!data && /destroy|hide/.test(option)) return
      if (!data) $this.data('bs.popover', (data = new Popover(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.popover

  $.fn.popover             = Plugin
  $.fn.popover.Constructor = Popover

  // POPOVER NO CONFLICT
  // ===================
  $.fn.popover.noConflict = function () {
    $.fn.popover = old
    return this
  }
}(jQuery);
