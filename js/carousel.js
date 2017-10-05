/* ========================================================================
 * Bootstrap: carousel.js v3.3.7(图片轮播)
 * http://getbootstrap.com/javascript/#carousel
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */
+function ($) {
  'use strict';

  // CAROUSEL CLASS DEFINITION
  // =========================
  var Carousel = function (element, options) {
    this.$element    = $(element);
    this.$indicators = this.$element.find('.carousel-indicators');
    this.options     = options;
    this.paused      = null;
    this.sliding     = null;  // 判断是否正在轮播项滚动
    this.interval    = null;  // 轮播循环播放定时器
    this.$active     = null;
    this.$items      = null;

    // 如果options.keyboard == true，则监听键盘事件
    this.options.keyboard && this.$element.on('keydown.bs.carousel', $.proxy(this.keydown, this));

    // 不是移动设备(不存在ontouchstart事件)，那么当options.pause == 'hover'时实现鼠标的悬浮暂停
    this.options.pause == 'hover' && !('ontouchstart' in document.documentElement) && this.$element
      .on('mouseenter.bs.carousel', $.proxy(this.pause, this))
      .on('mouseleave.bs.carousel', $.proxy(this.cycle, this))
  };

  Carousel.VERSION  = '3.3.7';

  Carousel.TRANSITION_DURATION = 600;

  Carousel.DEFAULTS = {
    interval: 5000,
    pause: 'hover',
    wrap: true,
    keyboard: true
  };

  // 键盘事件，做出相应操作
  Carousel.prototype.keydown = function (e) {
    if (/input|textarea/i.test(e.target.tagName)) return;
    switch (e.which) {
      case 37: this.prev(); break;
      case 39: this.next(); break;
      default: return
    }

    e.preventDefault()
  };

  // 循环轮播，清除定时器并重新设置定时器
  Carousel.prototype.cycle = function (e) {
    e || (this.paused = false);

    this.interval && clearInterval(this.interval);

    this.options.interval
      && !this.paused
      && (this.interval = setInterval($.proxy(this.next, this), this.options.interval));

    return this
  };

  // 获取轮播项索引值
  Carousel.prototype.getItemIndex = function (item) {
    this.$items = item.parent().children('.item');
    return this.$items.index(item || this.$active)
  };

  // 获取方向上的轮播项
  Carousel.prototype.getItemForDirection = function (direction, active) {
    var activeIndex = this.getItemIndex(active);
    var willWrap = (direction == 'prev' && activeIndex === 0)
                || (direction == 'next' && activeIndex == (this.$items.length - 1));
    if (willWrap && !this.options.wrap) return active;
    var delta = direction == 'prev' ? -1 : 1;
    // 如果itemIndex为负数-1，不需要做处理，因为eq函数参数为负数时从集合最后一个元素开始倒数
    var itemIndex = (activeIndex + delta) % this.$items.length;
    return this.$items.eq(itemIndex)
  };

  // 滚动到指定轮播项
  Carousel.prototype.to = function (pos) {
    var that        = this
    var activeIndex = this.getItemIndex(this.$active = this.$element.find('.item.active'));

    if (pos > (this.$items.length - 1) || pos < 0) return;

    // 如果轮播图正在滚动切换，那么滚动到指定轮播项需要等到滚动切换结束(即监听到slid.bs.carousel)时才能继续操作
    if (this.sliding)       return this.$element.one('slid.bs.carousel', function () { that.to(pos) }); // yes, "slid"
    if (activeIndex == pos) return this.pause().cycle();

    return this.slide(pos > activeIndex ? 'next' : 'prev', this.$items.eq(pos))
  };

  // 暂停轮播，清除定时器
  Carousel.prototype.pause = function (e) {
    e || (this.paused = true);

    // 如果刚好为轮播添加了next/prev类即将开始滚动并且浏览器支持动画，鼠标移入，那么直接触发动画结束自定义事件
    if (this.$element.find('.next, .prev').length && $.support.transition) {
      this.$element.trigger($.support.transition.end);
      this.cycle(true)
    }

    this.interval = clearInterval(this.interval);

    return this
  };

  // 下一个轮播图
  Carousel.prototype.next = function () {
    // 如果轮播图正在滚动切换，那么上下轮播切换不做任何操作
    if (this.sliding) return;
    return this.slide('next')
  };

  // 上一个轮播图
  Carousel.prototype.prev = function () {
    if (this.sliding) return;
    return this.slide('prev')
  };

  // 滚动函数
  Carousel.prototype.slide = function (type, next) {
    var $active   = this.$element.find('.item.active');
    var $next     = next || this.getItemForDirection(type, $active);
    var isCycling = this.interval;
    var direction = type == 'next' ? 'left' : 'right';
    var that      = this;

    if ($next.hasClass('active')) return (this.sliding = false);

    var relatedTarget = $next[0];
    // 触发轮播即将开始自定义事件
    var slideEvent = $.Event('slide.bs.carousel', {
      relatedTarget: relatedTarget,
      direction: direction
    });
    this.$element.trigger(slideEvent);
    if (slideEvent.isDefaultPrevented()) return;

    this.sliding = true;

    isCycling && this.pause();

    // 为计数器切换active类
    if (this.$indicators.length) {
      this.$indicators.find('.active').removeClass('active');
      var $nextIndicator = $(this.$indicators.children()[this.getItemIndex($next)]);
      $nextIndicator && $nextIndicator.addClass('active')
    }

    var slidEvent = $.Event('slid.bs.carousel', { relatedTarget: relatedTarget, direction: direction }); // yes, "slid"
    if ($.support.transition && this.$element.hasClass('slide')) {
      $next.addClass(type);
      $next[0].offsetWidth // force reflow
      $active.addClass(direction);
      $next.addClass(direction);
      $active
        .one('bsTransitionEnd', function () {
          $next.removeClass([type, direction].join(' ')).addClass('active');
          $active.removeClass(['active', direction].join(' '));
          that.sliding = false;
          setTimeout(function () {
            that.$element.trigger(slidEvent)
          }, 0)
        })
        .emulateTransitionEnd(Carousel.TRANSITION_DURATION)
    } else {
      $active.removeClass('active');
      $next.addClass('active');
      this.sliding = false;
      this.$element.trigger(slidEvent)
    }

    isCycling && this.cycle();

    return this
  };


  // CAROUSEL PLUGIN DEFINITION
  // ==========================
  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this);
      var data    = $this.data('bs.carousel');
      var options = $.extend({}, Carousel.DEFAULTS, $this.data(), typeof option == 'object' && option);
      var action  = typeof option == 'string' ? option : options.slide;

      if (!data) $this.data('bs.carousel', (data = new Carousel(this, options)));
      // js方法直接触发轮播，跳转到指定轮播页
      if (typeof option == 'number') data.to(option);
      // 在点击上、下一个时触发轮播
      else if (action) data[action]();
      // 初始化加载，在data-ride="carousel"且data-interval==true情况下触发轮播
      else if (options.interval) data.pause().cycle()
    })
  }

  var old = $.fn.carousel;

  $.fn.carousel             = Plugin;
  $.fn.carousel.Constructor = Carousel;

  // CAROUSEL NO CONFLICT
  // ====================
  $.fn.carousel.noConflict = function () {
    $.fn.carousel = old;
    return this
  };

  // CAROUSEL DATA-API
  // =================
  var clickHandler = function (e) {
    var href;
    var $this   = $(this);
    var $target = $($this.attr('data-target') || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')); // strip for ie7
    // 如果目标元素没有carousel类，说明不是carousel容器，不做任何处理
    if (!$target.hasClass('carousel')) return;
    var options = $.extend({}, $target.data(), $this.data());
    var slideIndex = $this.attr('data-slide-to');
    if (slideIndex) options.interval = false;

    Plugin.call($target, options);

    if (slideIndex) {
      $target.data('bs.carousel').to(slideIndex)
    }

    // 防止使用a标签改变了链接地址等，阻止默认事件发生
    e.preventDefault()
  };

  $(document)
    .on('click.bs.carousel.data-api', '[data-slide]', clickHandler)
    .on('click.bs.carousel.data-api', '[data-slide-to]', clickHandler);

  $(window).on('load', function () {
    $('[data-ride="carousel"]').each(function () {
      var $carousel = $(this)
      Plugin.call($carousel, $carousel.data())
    })
  })

}(jQuery);
