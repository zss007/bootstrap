/* ========================================================================
 * Bootstrap: dropdown.js v3.3.7(下拉菜单)
 * http://getbootstrap.com/javascript/#dropdowns
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // DROPDOWN CLASS DEFINITION
  // =========================
  var backdrop = '.dropdown-backdrop'
  var toggle   = '[data-toggle="dropdown"]'
  var Dropdown = function (element) {
    $(element).on('click.bs.dropdown', this.toggle)
  }

  Dropdown.VERSION = '3.3.7'

  // 获取触发按钮或链接的目标元素
  function getParent($this) {
    var selector = $this.attr('data-target')

    // 如果不存在data-target，那么获取href属性并将格式处理为CSS选择器
    if (!selector) {
      selector = $this.attr('href')
      selector = selector && /#[A-Za-z]/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
    }

    // 如果存在目标元素，那么直接选中
    var $parent = selector && $(selector)

    // 否则默认使用触发元素的父元素
    return $parent && $parent.length ? $parent : $this.parent()
  }

  // 隐藏下拉菜单
  function clearMenus(e) {
    // 如果鼠标右键点击不做任何处理
    if (e && e.which === 3) return
    // 移除背景
    $(backdrop).remove()
    $(toggle).each(function () {
      var $this         = $(this)
      var $parent       = getParent($this)
      var relatedTarget = { relatedTarget: this }

      // 如果不是下拉菜单已经展开菜单了，那么不做任何处理
      if (!$parent.hasClass('open')) return

      // 如果事件发生在目标元素中的input/textarea元素中，那么不做任何处理
      if (e && e.type == 'click' && /input|textarea/i.test(e.target.tagName) && $.contains($parent[0], e.target)) return

      // 触发开始隐藏菜单事件
      $parent.trigger(e = $.Event('hide.bs.dropdown', relatedTarget))

      if (e.isDefaultPrevented()) return

      $this.attr('aria-expanded', 'false')
      // 触发已经隐藏菜单事件
      $parent.removeClass('open').trigger($.Event('hidden.bs.dropdown', relatedTarget))
    })
  }

  // 切换下拉菜单显示状态
  Dropdown.prototype.toggle = function (e) {
    var $this = $(this)

    if ($this.is('.disabled, :disabled')) return

    var $parent  = getParent($this)
    var isActive = $parent.hasClass('open')

    clearMenus()

    // 显示下拉菜单
    if (!isActive) {
      // 如果是在移动设备上，那么点击后添加遮罩层
      if ('ontouchstart' in document.documentElement && !$parent.closest('.navbar-nav').length) {
        // if mobile we use a backdrop because click events don't delegate
        $(document.createElement('div'))
          .addClass('dropdown-backdrop')
          .insertAfter($(this))
          .on('click', clearMenus)
      }

      var relatedTarget = { relatedTarget: this }
      $parent.trigger(e = $.Event('show.bs.dropdown', relatedTarget))

      if (e.isDefaultPrevented()) return

      $this
        .trigger('focus')
        .attr('aria-expanded', 'true')

      $parent
        .toggleClass('open')
        .trigger($.Event('shown.bs.dropdown', relatedTarget))
    }

    // 返回false，阻止冒泡和默认事件发生；如果是用JS直接触发，而且JS绑定的元素是document的子元素就可以避免绑定触发多次的问题，因为这里返回了false
    return false
  }

  // 键盘事件处理函数
  Dropdown.prototype.keydown = function (e) {
    // 38:Up Arrow; 40:Down Arrow; 27:Esc; 32:Spacebar
    if (!/(38|40|27|32)/.test(e.which) || /input|textarea/i.test(e.target.tagName)) return

    var $this = $(this)

    e.preventDefault()
    e.stopPropagation()

    if ($this.is('.disabled, :disabled')) return

    var $parent  = getParent($this)
    var isActive = $parent.hasClass('open')

    if (!isActive && e.which != 27 || isActive && e.which == 27) {
      // 如果菜单处于展开状态而且点击esc键盘按钮，那么让触发元素获取焦点
      if (e.which == 27) $parent.find(toggle).trigger('focus')
      // 触发元素上触发点击事件
      return $this.trigger('click')
    }

    var desc = ' li:not(.disabled):visible a'
    var $items = $parent.find('.dropdown-menu' + desc)

    // 如果$items.length == false，说明拓展菜单隐藏，不执行下面操作；否则执行下拉菜单选择，选中菜单触发focus事件
    if (!$items.length) return

    var index = $items.index(e.target)

    if (e.which == 38 && index > 0)                 index--         // up
    if (e.which == 40 && index < $items.length - 1) index++         // down
    if (!~index)                                    index = 0

    $items.eq(index).trigger('focus')
  }


  // DROPDOWN PLUGIN DEFINITION
  // ==========================
  function Plugin(option) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.dropdown')

      if (!data) $this.data('bs.dropdown', (data = new Dropdown(this)))
      if (typeof option == 'string') data[option].call($this)
    })
  }

  var old = $.fn.dropdown

  $.fn.dropdown             = Plugin
  $.fn.dropdown.Constructor = Dropdown


  // DROPDOWN NO CONFLICT
  // ====================
  $.fn.dropdown.noConflict = function () {
    $.fn.dropdown = old
    return this
  }


  // APPLY TO STANDARD DROPDOWN ELEMENTS
  // ===================================
  $(document)
    // 如果点击发生在document上，那么隐藏拓展开的菜单
    .on('click.bs.dropdown.data-api', clearMenus)
    // 如果点击事件发生在下拉菜单元素上，那么阻止冒泡到document上
    .on('click.bs.dropdown.data-api', '.dropdown form', function (e) { e.stopPropagation() })
    // 如果点击在触发元素上，触发Dropdown.prototype.toggle事件
    .on('click.bs.dropdown.data-api', toggle, Dropdown.prototype.toggle)
    // 在触发元素上设置键盘监听函数
    .on('keydown.bs.dropdown.data-api', toggle, Dropdown.prototype.keydown)
    // 如果是展开状态(只有展开状态才有.dropdown-menu)，那么则在展开菜单上也设置监听函数
    .on('keydown.bs.dropdown.data-api', '.dropdown-menu', Dropdown.prototype.keydown)
}(jQuery);
