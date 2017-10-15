/* ========================================================================
 * Bootstrap: affix.js v3.3.7(自动定位浮标)
 * http://getbootstrap.com/javascript/#affix
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * bottom使用时会有bug(见107行)
 * ======================================================================== */

+function ($) {
  'use strict';

  // AFFIX CLASS DEFINITION
  // ======================
  var Affix = function (element, options) {
    this.options = $.extend({}, Affix.DEFAULTS, options)

    this.$target = $(this.options.target)
      .on('scroll.bs.affix.data-api', $.proxy(this.checkPosition, this))
      .on('click.bs.affix.data-api',  $.proxy(this.checkPositionWithEventLoop, this))

    this.$element     = $(element)
    this.affixed      = null
    this.unpin        = null
    this.pinnedOffset = null

    this.checkPosition()
  }

  Affix.VERSION  = '3.3.7'

  Affix.RESET    = 'affix affix-top affix-bottom'

  Affix.DEFAULTS = {
    offset: 0,
    target: window
  }

  // 获取滚动状态
  Affix.prototype.getState = function (scrollHeight, height, offsetTop, offsetBottom) {
    var scrollTop    = this.$target.scrollTop()  // 滚动元素(目标元素|Window)的滚动距离
    var position     = this.$element.offset()    // 元素相对于视口的距离
    var targetHeight = this.$target.height()     // 滚动元素(目标元素|Window)的可视高度

    // 后续滚动的话，如果滚动元素的滚动距离少于自定义向上偏移量offsetTop，返回'top'
    if (offsetTop != null && this.affixed == 'top') return scrollTop < offsetTop ? 'top' : false

    if (this.affixed == 'bottom') {
      // target的top＋getpinnedOffset的值>粘住元素当前定位到top的值, 返回'bottom'
      if (offsetTop != null) return (scrollTop + this.unpin <= position.top) ? false : 'bottom'
      // target的top＋target元素的高度>文档高度–粘住元素距离底部的高度
      return (scrollTop+targetHeight<=scrollHeight-offsetBottom) ? false : 'bottom'
    }

    // 初次运行执行代码
    var initializing   = this.affixed == null
    var colliderTop    = initializing ? scrollTop : position.top
    var colliderHeight = initializing ? targetHeight : height

    // 初始时，如果滚动元素的滚动距离少于等于自定义向上偏移量offsetTop，返回'top'
    if (offsetTop != null && scrollTop <= offsetTop) return 'top'
    // 初始时，如果滚动元素的滚动距离+滚动元素的高度+自定义向下偏移量offsetBottom大于内容高度，返回'bottom'
    // 滚动时，如果元素的offsetTop(距顶部距离)+元素的高度+自定义向下偏移量offsetBottom大于内容高度，返回'bottom'
    if (offsetBottom != null && (colliderTop + colliderHeight >= scrollHeight - offsetBottom)) return 'bottom'

    return false
  }

  // 获取粘住元素top–target滚动条的top
  Affix.prototype.getPinnedOffset = function () {
    if (this.pinnedOffset) return this.pinnedOffset
    this.$element.removeClass(Affix.RESET).addClass('affix')
    var scrollTop = this.$target.scrollTop()
    var position  = this.$element.offset()
    return (this.pinnedOffset = position.top - scrollTop)
  }

  // 如果点击目标元素，那么滚动元素会通过锚点滚动，然后执行checkPosition，判断菜单位置
  Affix.prototype.checkPositionWithEventLoop = function () {
    setTimeout($.proxy(this.checkPosition, this), 1)
  }

  // 检查位置信息
  Affix.prototype.checkPosition = function () {
    // 如果data-spy="affix"元素不可见，那么直接返回
    if (!this.$element.is(':visible')) return

    var height       = this.$element.height()
    var offset       = this.options.offset
    var offsetTop    = offset.top
    var offsetBottom = offset.bottom
    // 文档内容高度
    var scrollHeight = Math.max($(document).height(), $(document.body).height())

    // 如果offset不是对象，那么offsetBottom、offsetTop均为offset
    if (typeof offset != 'object')         offsetBottom = offsetTop = offset
    // 如果offsetTop、offsetBottom为function，那么offsetTop、offsetBottom将执行并以this.$element为参数得到结果作为值
    if (typeof offsetTop == 'function')    offsetTop    = offset.top(this.$element)
    if (typeof offsetBottom == 'function') offsetBottom = offset.bottom(this.$element)

    var affix = this.getState(scrollHeight, height, offsetTop, offsetBottom)

    if (this.affixed != affix) {
      // 从affix-bottom到其他状态，设置top样式为0
      if (this.unpin != null) this.$element.css('top', '')
      // 去掉行内样式position，不然会覆盖掉position为fixed的affix类样式，affix的bug
        // , this.$element.css('position', '')

      var affixType = 'affix' + (affix ? '-' + affix : '')

      var e         = $.Event(affixType + '.bs.affix')
      this.$element.trigger(e)
      if (e.isDefaultPrevented()) return

      this.affixed = affix
      this.unpin = affix == 'bottom' ? this.getPinnedOffset() : null

      this.$element
        .removeClass(Affix.RESET)
        .addClass(affixType)
        .trigger(affixType.replace('affix', 'affixed') + '.bs.affix')
    }

    // 到达底部时，去掉fixed后，改成relative，设置top属性为刚为bottom时的位置
    if (affix == 'bottom') {
      this.$element.offset({
        top: scrollHeight - height - offsetBottom
      })
    }
  }


  // AFFIX PLUGIN DEFINITION
  // =======================
  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.affix')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.affix', (data = new Affix(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.affix

  $.fn.affix             = Plugin
  $.fn.affix.Constructor = Affix


  // AFFIX NO CONFLICT
  // =================
  $.fn.affix.noConflict = function () {
    $.fn.affix = old
    return this
  }


  // AFFIX DATA-API
  // ==============
  $(window).on('load', function () {
    $('[data-spy="affix"]').each(function () {
      var $spy = $(this)
      var data = $spy.data()

      data.offset = data.offset || {}

      if (data.offsetBottom != null) data.offset.bottom = data.offsetBottom
      if (data.offsetTop    != null) data.offset.top    = data.offsetTop

      Plugin.call($spy, data)
    })
  })
}(jQuery);
