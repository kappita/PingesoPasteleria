(function($){
  $(function(){
    var cfg = window.WCPDD_CFG || {};
    console.log('WCPDD JS init', cfg);

    function setupPicker(selector){
      var $el = $(selector);
      if (!$el.length) {
        console.warn('WCPDD: input no encontrado', selector);
        return;
      }

      // Si no está jQuery UI, usa input nativo
      if (typeof $.fn.datepicker !== 'function') {
        console.warn('WCPDD: jQuery UI datepicker no disponible. Uso input nativo.');
        $el.attr('type','date');
        if (cfg.minDate) $el.attr('min', cfg.minDate);
        if (!$el.val() && cfg.firstValid) $el.val(cfg.firstValid);
        paintGlobal();
        return;
      }

      var blocked = (cfg.blockedDates || []).slice();
      var allowedWeekdays = (cfg.allowedWeekdays || [1,2,3,4,5,6]); // 0=Dom..6=Sab
      var fmt = cfg.dateFormat || 'yy-mm-dd';

      function ymd(date){
        var y=date.getFullYear();
        var m=('0'+(date.getMonth()+1)).slice(-2);
        var d=('0'+date.getDate()).slice(-2);
        return y+'-'+m+'-'+d;
      }
      function isAllowed(date){
        var dow = date.getDay();
        var s = ymd(date);
        if (blocked.indexOf(s) !== -1) return false;
        if (allowedWeekdays.indexOf(dow) === -1) return false;
        return true;
      }

      // minDate
      var parts = (cfg.minDate || '').split('-');
      var minDate = parts.length===3 ? new Date(parts[0], parts[1]-1, parts[2]) : new Date();

      // Primera fecha válida
      var first = (function(){
        if (cfg.firstValid) {
          var p = cfg.firstValid.split('-');
          if (p.length===3) return new Date(p[0], p[1]-1, p[2]);
        }
        var f = new Date(minDate.getTime());
        for (var i=0;i<366;i++){ if (isAllowed(f)) break; f.setDate(f.getDate()+1); }
        return f;
      })();

      // Forzar text para usar jQuery UI cross-browser
      $el.attr('type','text');

      $el.datepicker({
        dateFormat: fmt,
        minDate: minDate,
        beforeShowDay: function(date){
          var ok = isAllowed(date);
          return [ ok, '', ok ? '' : 'No disponible' ];
        }
      });

      // Autorrellenar
      if (!$el.val() && first && isAllowed(first)) {
        var y=first.getFullYear(), m=('0'+(first.getMonth()+1)).slice(-2), d=('0'+first.getDate()).slice(-2);
        $el.datepicker('setDate', y+'-'+m+'-'+d);
      }

      // Texto de cupo global
      paintGlobal();
    }

    function paintGlobal(){
      if (!cfg.ajaxUrl) return;
      $.get(cfg.ajaxUrl, { action:'wcpdd_remaining_global' }, function(resp){
        if (resp && resp.success){
          $('#wcpdd-remaining-global').text(
            'Cupo global disponible: ' + resp.data.remaining + ' (de ' + resp.data.capacity + ').'
          );
        }
      }, 'json');
    }

    // Producto
    if (cfg.selector_product)  setupPicker(cfg.selector_product);
    // (Opcional) Checkout a nivel pedido
    if (cfg.selector_checkout) setupPicker(cfg.selector_checkout);
  });
})(jQuery);

