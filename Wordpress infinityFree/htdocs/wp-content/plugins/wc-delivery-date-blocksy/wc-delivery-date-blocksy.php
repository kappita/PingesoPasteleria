<?php
/**
 * Plugin Name: WC Delivery Date for Blocksy (per product + checkout) + Cupos Globales & Límite Diario
 * Description: Calendario de fecha de entrega en producto (y opcional en checkout), con lead time/feriados. Cupo GLOBAL con reservas tipo cine en checkout y límite por día configurable.
 * Version: 1.2.0
 * Author: Tú
 */

if ( ! defined('ABSPATH') ) exit;

final class WCPDD {
    // === AJUSTES RÁPIDOS ===
    private static $lead_days = 3;                 // Cambia a 4 si quieres 4 días de anticipación
    private static $allowed_weekdays = [1,2,3,4,5,6]; // 0=Dom … 6=Sáb (aquí Lun–Sáb)

    // Feriados fijos (mm-dd) — opcional
    private static $blocked_mmdd = [
        // '12-25',
    ];
    // Fechas específicas (Y-m-d) — opcional
    private static $blocked_dates_y = [
        // '2025-12-31',
    ];

    // Campo opcional a nivel PEDIDO (checkout clásico)
    private static $enable_checkout_field = true;

    // Identificador del campo
    private static $field_key = 'wcpdd_delivery_date';
    
    // --- TIEMPO DE RESERVA (minutos) ---
    private static $default_hold_ttl = 15; // por defecto 15 min
    private static function get_hold_ttl_minutes() {
        $v = get_option('wcpdd_hold_ttl');
        if ($v === false || $v === '') $v = self::$default_hold_ttl;
        $v = max(1, intval($v)); // mínimo 1 minuto
        // Permite override vía filtro para desarrolladores
        return apply_filters('wcpdd_hold_ttl_minutes', $v);
    }


    // --- CAPACIDAD GLOBAL ---
    private static $default_global_capacity = 10; // valor por defecto si no se configura
    private static function get_global_capacity() {
        $v = get_option('wcpdd_global_capacity');
        if ($v === false || $v === '') return self::$default_global_capacity;
        return max(0, intval($v));
    }

    // --- LÍMITE POR DÍA ---
    private static $default_daily_limit = 3; // máximo unidades por fecha
    private static function get_daily_limit() {
        $v = get_option('wcpdd_daily_limit');
        if ($v === false || $v === '') return self::$default_daily_limit;
        return max(0, intval($v));
    }

    // ===== Utilidades de fecha =====
    private static function tz() {
        return function_exists('wp_timezone') ? wp_timezone() : new DateTimeZone( get_option('timezone_string') ?: 'UTC' );
    }
    private static function today() {
        return new DateTime('today', self::tz());
    }
    private static function min_date() {
        $d = self::today();
        return $d->modify('+'.intval(self::$lead_days).' days');
    }
    private static function blocked_list() {
        $tz  = self::tz();
        $now = new DateTime('now', $tz);
        $Y0  = (int)$now->format('Y');
        $Y1  = $Y0 + 1;
        $blocked = self::$blocked_dates_y;
        foreach ( self::$blocked_mmdd as $mmdd ) {
            if ( preg_match('/^\d{2}-\d{2}$/', $mmdd) ) {
                $blocked[] = sprintf('%04d-%s', $Y0, $mmdd);
                $blocked[] = sprintf('%04d-%s', $Y1, $mmdd);
            }
        }
        return array_values(array_unique($blocked));
    }
    private static function first_valid_date_str() {
        $min = clone self::min_date();
        for ($i=0; $i<366; $i++) {
            $dow = (int)$min->format('w'); // 0..6
            $ymd = $min->format('Y-m-d');
            if ( in_array($dow, self::$allowed_weekdays, true) && ! in_array($ymd, self::blocked_list(), true) ) {
                return $ymd;
            }
            $min->modify('+1 day');
        }
        return self::min_date()->format('Y-m-d');
    }

    // === USO GLOBAL (pedidos + reservas activas) ===
    public static function get_global_used_units() {
        // 1) Pedidos confirmados (estados activos)
        $orders = wc_get_orders([
            'limit'   => -1,
            'type'    => 'shop_order',
            'status'  => ['pending','processing','on-hold','completed'], // ajusta a tu flujo
            'return'  => 'ids',
        ]);
        $sum_orders = 0;
        foreach ($orders as $oid) {
            $q = get_post_meta($oid, '_wcpdd_qty_total', true);
            if ($q !== '' && $q !== false) { $sum_orders += intval($q); continue; }
            $order = wc_get_order($oid);
            if (!$order) continue;
            foreach ( $order->get_items() as $item ) { $sum_orders += intval($item->get_quantity()); }
        }

        // 2) Reservas activas (checkout)
        $holds = wcpdd_get_active_holds();
        $sum_holds = 0;
        foreach ($holds as $h) {
            $sum_holds += intval($h['qty_total'] ?? 0);
        }

        return $sum_orders + $sum_holds;
    }
    private static function get_global_remaining_units() {
        return max(0, self::get_global_capacity() - self::get_global_used_units());
    }

    // === Ocupación por FECHA (pedidos confirmados + reservas) ===
    private static function committed_units_for_date( $ymd ) {
        $orders = wc_get_orders([
            'limit'   => -1,
            'type'    => 'shop_order',
            'status'  => ['pending','processing','on-hold','completed'],
            'return'  => 'ids',
        ]);
        $sum = 0;
        foreach ($orders as $oid) {
            $order = wc_get_order($oid);
            if ( ! $order ) continue;
            foreach ( $order->get_items() as $item ) {
                $date = $item->get_meta( 'Fecha de entrega', true );
                if ( $date === $ymd ) $sum += intval($item->get_quantity());
            }
        }
        return $sum;
    }
    private static function held_units_for_date( $ymd ) {
        $holds = wcpdd_get_active_holds();
        $sum = 0;
        foreach ($holds as $h) {
            if ( ! empty($h['dates'][$ymd]) ) $sum += intval($h['dates'][$ymd]);
        }
        return $sum;
    }
    private static function total_used_for_date( $ymd ) {
        return self::committed_units_for_date($ymd) + self::held_units_for_date($ymd);
    }

    // ===== Enqueue (producto y checkout) =====
    public static function enqueue() {
        if ( ! ( is_product() || ( function_exists('is_checkout') && is_checkout() ) ) ) return;

        // jQuery UI datepicker + CSS
        wp_enqueue_script('jquery-ui-datepicker');
        wp_enqueue_style('jquery-ui-css', 'https://code.jquery.com/ui/1.13.2/themes/base/jquery-ui.css', [], '1.13.2');

        // JS del plugin
        wp_register_script('wcpdd-js', plugins_url('wcpdd.js', __FILE__), ['jquery','jquery-ui-datepicker'], '1.2.0', true);
        wp_localize_script('wcpdd-js', 'WCPDD_CFG', [
            'selector_product'  => '#'.self::$field_key,
            'selector_checkout' => '#'.self::$field_key.'-checkout',
            'blockedDates'      => self::blocked_list(),
            'allowedWeekdays'   => array_values(self::$allowed_weekdays),
            'minDate'           => self::min_date()->format('Y-m-d'),
            'firstValid'        => self::first_valid_date_str(),
            'dateFormat'        => 'yy-mm-dd',
            'ajaxUrl'           => admin_url('admin-ajax.php'),
        ]);
        wp_enqueue_script('wcpdd-js');

        // Evitar que el datepicker quede detrás de overlays
        $css = '.ui-datepicker{z-index:99999!important;}';
        wp_add_inline_style('jquery-ui-css', $css);

        // Log mínimo
        add_action('wp_footer', function(){
            if ( is_product() || ( function_exists('is_checkout') && is_checkout() ) ) {
                echo '<script>console.log("WCPDD enqueue OK");</script>';
            }
        });
    }

    // ===== PRODUCTO: campo fecha =====
    public static function product_field() {
        echo '<div class="wcpdd-wrap" style="margin:12px 0">';
        echo '<label for="'.esc_attr(self::$field_key).'" style="display:block;margin-bottom:6px;font-weight:600">'
            . esc_html__('Fecha deseada de entrega', 'wcpdd') . '</label>';
        echo '<input type="text" id="'.esc_attr(self::$field_key).'" name="'.esc_attr(self::$field_key).'" value="" placeholder="'.esc_attr__('AAAA-MM-DD','wcpdd').'" style="max-width:320px;width:100%">';
        echo '<small>'.esc_html__('El calendario respeta anticipación, días hábiles y feriados.', 'wcpdd').'</small>';
        echo '<div id="wcpdd-remaining-global" style="margin-top:6px;font-size:13px;color:#444"></div>';
        echo '</div>';
    }

    // Validar al añadir al carrito
    public static function validate_add_to_cart( $passed, $product_id, $quantity ) {
        $key = self::$field_key;
        $val = isset($_POST[$key]) ? sanitize_text_field($_POST[$key]) : '';

        if ( empty($val) ) {
            wc_add_notice( __('Por favor elige la fecha de entrega (producto).', 'wcpdd'), 'error' );
            return false;
        }

        $tz   = self::tz();
        $date = DateTime::createFromFormat('Y-m-d', $val, $tz);
        if ( ! $date || $date->format('Y-m-d') !== $val ) {
            wc_add_notice( __('La fecha de entrega no es válida (usa AAAA-MM-DD).', 'wcpdd'), 'error' );
            return false;
        }
        if ( $date < self::min_date() ) {
            wc_add_notice( sprintf( __('La fecha debe ser a partir de %s.', 'wcpdd'), self::min_date()->format('Y-m-d') ), 'error' );
            return false;
        }
        $dow = (int)$date->format('w');
        if ( ! in_array($dow, self::$allowed_weekdays, true) ) {
            wc_add_notice( __('Ese día no está disponible para entregas.', 'wcpdd'), 'error' );
            return false;
        }
        if ( in_array($date->format('Y-m-d'), self::blocked_list(), true ) ) {
            wc_add_notice( __('La fecha seleccionada está bloqueada.', 'wcpdd'), 'error' );
            return false;
        }

        // === Cupo GLOBAL (pedidos + reservas activas) vs. (este add + lo ya en carrito)
        $remaining_global = max(0, self::get_global_capacity() - self::get_global_used_units());
        $qty_req = isset($_REQUEST['quantity']) ? max(1, intval($_REQUEST['quantity'])) : 1;
        $qty_cart_other = 0;
        if ( WC()->cart ) {
            foreach ( WC()->cart->get_cart() as $ci ) $qty_cart_other += intval($ci['quantity']);
        }
        if ( ($qty_req + $qty_cart_other) > $remaining_global ) {
            wc_add_notice( sprintf(
                __('No hay cupos globales suficientes. Quedan %1$d.', 'wcpdd'),
                $remaining_global
            ), 'error' );
            return false;
        }

        // === Límite POR DÍA: pedidos confirmados + reservas activas + lo ya en carrito para esa fecha
        $ymd = $date->format('Y-m-d');
        $daily_limit = self::get_daily_limit();
        if ( $daily_limit > 0 ) {
            $used_for_day = self::total_used_for_date($ymd);
            $in_cart_same_day = 0;
            if ( WC()->cart ) {
                foreach ( WC()->cart->get_cart() as $ci ) {
                    if ( isset($ci[$key]) && $ci[$key] === $ymd ) {
                        $in_cart_same_day += intval($ci['quantity']);
                    }
                }
            }
            $requested_for_day = $in_cart_same_day + $qty_req;
            $remaining_day = max(0, $daily_limit - $used_for_day);
            if ( $requested_for_day > $remaining_day ) {
                wc_add_notice( sprintf(
                    __('Para %1$s solo quedan %2$d cupos diarios (límite %3$d).', 'wcpdd'),
                    esc_html($ymd), $remaining_day, $daily_limit
                ), 'error' );
                return false;
            }
        }

        return $passed;
    }

    // Guardar en el ítem de carrito
    public static function add_cart_item_data( $cart_item_data, $product_id, $variation_id ) {
        $key = self::$field_key;
        if ( isset($_POST[$key]) && $_POST[$key] !== '' ) {
            $cart_item_data[$key] = sanitize_text_field($_POST[$key]);
        }
        return $cart_item_data;
    }

    // Mostrar en el carrito / checkout (línea del producto)
    public static function display_cart_item_data( $item_data, $cart_item ) {
        $key = self::$field_key;
        if ( isset($cart_item[$key]) ) {
            $ymd = $cart_item[$key];
            $item_data[] = [
                'name'  => __('Fecha de entrega', 'wcpdd'),
                'value' => esc_html($ymd),
            ];
            $item_data[] = [
                'name'  => __('Cupo global disponible', 'wcpdd'),
                'value' => esc_html( self::get_global_remaining_units() ),
            ];
        }
        return $item_data;
    }

    // Pasar a meta del pedido (por ítem)
    public static function order_line_item_meta( $item, $cart_item_key, $values, $order ) {
        $key = self::$field_key;
        if ( isset($values[$key]) ) {
            $item->add_meta_data( __('Fecha de entrega', 'wcpdd'), sanitize_text_field($values[$key]), true );
        }
    }

    // ===== ADMIN: página de ajustes (capacidad global y límite diario) =====
    public static function admin_menu() {
        add_submenu_page(
            'woocommerce',
            'Cupos & límites',
            'Cupos & límites',
            'manage_woocommerce',
            'wcpdd-capacity',
            [__CLASS__, 'admin_page_render']
        );
    }
    public static function admin_page_render() {
        if ( isset($_POST['wcpdd_capacity_nonce']) && wp_verify_nonce($_POST['wcpdd_capacity_nonce'], 'wcpdd_save_capacity') ) {
            if ( isset($_POST['wcpdd_global_capacity']) )
                update_option('wcpdd_global_capacity', max(0, intval($_POST['wcpdd_global_capacity'])));
            if ( isset($_POST['wcpdd_daily_limit']) )
                update_option('wcpdd_daily_limit', max(0, intval($_POST['wcpdd_daily_limit'])));
            if ( isset($_POST['wcpdd_hold_ttl']) )
    			update_option('wcpdd_hold_ttl', max(1, intval($_POST['wcpdd_hold_ttl'])));
            echo '<div class="updated"><p>Ajustes actualizados.</p></div>';
        }
        $cap   = esc_attr( self::get_global_capacity() );
        $daily = esc_attr( self::get_daily_limit() );
        $ttl = esc_attr( self::get_hold_ttl_minutes() );
        echo '<div class="wrap"><h1>Cupos & límites</h1>
        <form method="post">'.wp_nonce_field('wcpdd_save_capacity','wcpdd_capacity_nonce', true, false).'
            <table class="form-table">
                <tr>
                    <th scope="row"><label for="wcpdd_global_capacity">Capacidad global (unidades)</label></th>
                    <td><input name="wcpdd_global_capacity" id="wcpdd_global_capacity" type="number" min="0" value="'.$cap.'" class="regular-text" />
                    <p class="description">Total de productos que puedes producir en total (suma global), independiente de la fecha.</p></td>
                </tr>
                <tr>
                    <th scope="row"><label for="wcpdd_daily_limit">Máximo por día (unidades)</label></th>
                    <td><input name="wcpdd_daily_limit" id="wcpdd_daily_limit" type="number" min="0" value="'.$daily.'" class="regular-text" />
                    <p class="description">Tope adicional por fecha (además del cupo global). 0 = sin tope por día.</p></td>
                </tr>
                <tr>
                  <th scope="row"><label for="wcpdd_hold_ttl">Tiempo de reserva en checkout (min)</label></th>
                  <td>
                    <input name="wcpdd_hold_ttl" id="wcpdd_hold_ttl" type="number" min="1" value="<?php echo $ttl; ?>" class="regular-text" />
                    <p class="description">Durante este tiempo, el carrito “reserva” cupos como si fuera un cine. Si el cliente no paga antes de que expire, la reserva se libera.</p>
                  </td>
                </tr>
            </table>
            <p class="submit"><button type="submit" class="button button-primary">Guardar</button></p>
        </form></div>';
    }

    // ===== CHECKOUT: validación y RESERVA tipo cine =====
    public static function checkout_capacity_guard_global() {
        if ( ! WC()->cart ) return;

        // 1) GLOBAL (contra pedidos + reservas activas)
        $qty_cart_total = 0;
        foreach ( WC()->cart->get_cart() as $item ) $qty_cart_total += intval($item['quantity']);
        $remaining_global = max(0, self::get_global_capacity() - self::get_global_used_units());
        if ( $qty_cart_total > $remaining_global ) {
            wc_add_notice( sprintf(
                __('Cupo global alcanzado: quedan %1$d y tu carrito tiene %2$d.', 'wcpdd'),
                $remaining_global, $qty_cart_total
            ), 'error' );
        }

        // 2) POR DÍA (contra pedidos + reservas)
        $daily_limit = self::get_daily_limit();
        if ( $daily_limit > 0 ) {
            $map = []; // fecha => qty en este carrito
            foreach ( WC()->cart->get_cart() as $ci ) {
                $d = isset($ci[self::$field_key]) ? $ci[self::$field_key] : null;
                if ( ! $d ) continue;
                if ( ! isset($map[$d]) ) $map[$d]=0;
                $map[$d] += intval($ci['quantity']);
            }
            foreach ($map as $ymd => $qty_cart_for_day) {
                $used_for_day = self::total_used_for_date($ymd);
                $remaining_day = max(0, $daily_limit - $used_for_day);
                if ( $qty_cart_for_day > $remaining_day ) {
                    wc_add_notice( sprintf(
                        __('Para %1$s solo quedan %2$d cupos diarios (límite %3$d).', 'wcpdd'),
                        esc_html($ymd), $remaining_day, $daily_limit
                    ), 'error' );
                }
            }
        }

        // 3) Activa/renueva la RESERVA de esta sesión (15 min)
        wcpdd_upsert_hold_for_current_session( self::get_hold_ttl_minutes() );
    }

    // Hook para iniciar/renovar reserva al entrar a checkout (por si se llega por GET)
    public static function maybe_start_hold() {
        if ( function_exists('is_checkout') && is_checkout() && ! is_order_received_page() ) {
            wcpdd_upsert_hold_for_current_session( self::get_hold_ttl_minutes() );
        }
    }

    // Al crear el pedido: guardar qty total (para cómputo) y limpiar reserva
    public static function checkout_save_order_capacity( $order, $data ) {
        $qty_total = 0;
        foreach ( $order->get_items() as $item ) {
            $qty_total += intval( $item->get_quantity() );
        }
        $order->update_meta_data( '_wcpdd_qty_total', max(0, intval($qty_total)) );

        // Liberar reserva de esta sesión (ya no debe contar como hold)
        wcpdd_clear_hold_for_current_session();
    }

    // ===== CHECKOUT: campo opcional a nivel pedido =====
    public static function checkout_field( $fields ) {
        if ( ! self::$enable_checkout_field ) return $fields;
        $fields['billing'][ self::$field_key . '_checkout' ] = [
            'type'        => 'text',
            'label'       => __('Fecha de entrega (pedido)', 'wcpdd'),
            'required'    => false,
            'priority'    => 210,
            'class'       => ['form-row-wide'],
            'placeholder' => 'AAAA-MM-DD',
        ];
        return $fields;
    }
    public static function checkout_validate() {
        if ( ! self::$enable_checkout_field ) return;
        $key = self::$field_key . '_checkout';
        if ( empty($_POST[$key]) ) return; // es opcional
        $tz   = self::tz();
        $val  = sanitize_text_field($_POST[$key]);
        $date = DateTime::createFromFormat('Y-m-d', $val, $tz);
        if ( ! $date || $date->format('Y-m-d') !== $val ) {
            wc_add_notice( __('La fecha de entrega (pedido) no es válida. Usa AAAA-MM-DD.', 'wcpdd'), 'error' ); return;
        }
        if ( $date < self::min_date() ) {
            wc_add_notice( sprintf( __('La fecha de entrega (pedido) debe ser a partir de %s.', 'wcpdd'), self::min_date()->format('Y-m-d') ), 'error' ); return;
        }
        $dow = (int)$date->format('w');
        if ( ! in_array($dow, self::$allowed_weekdays, true) ) {
            wc_add_notice( __('Ese día (pedido) no está disponible para entregas.', 'wcpdd'), 'error' ); return;
        }
        if ( in_array($date->format('Y-m-d'), self::blocked_list(), true ) ) {
            wc_add_notice( __('La fecha (pedido) está bloqueada.', 'wcpdd'), 'error' ); return;
        }
    }
    public static function checkout_save_order_meta( $order, $data ) {
        if ( ! self::$enable_checkout_field ) return;
        $key = self::$field_key . '_checkout';
        if ( ! empty($_POST[$key]) ) {
            $order->update_meta_data( '_wcpdd_delivery_date', sanitize_text_field($_POST[$key]) );
        }
    }

    // Admin: mostrar fecha en pedido
    public static function admin_order_meta( $order ) {
        $v = $order->get_meta('_wcpdd_delivery_date');
        if ( $v ) {
            echo '<p><strong>'.esc_html__('Fecha de entrega (pedido)', 'wcpdd').':</strong> '.esc_html($v).'</p>';
        }
    }
    // Emails: mostrar fecha
    public static function email_meta( $fields, $sent_to_admin, $order ) {
        $v = $order->get_meta('_wcpdd_delivery_date');
        if ( $v ) {
            $fields['wcpdd_delivery'] = [
                'label' => __('Fecha de entrega (pedido)', 'wcpdd'),
                'value' => $v,
            ];
        }
        return $fields;
    }

    // ===== Hooks =====
    public static function hooks() {
        add_action('wp_enqueue_scripts', [__CLASS__, 'enqueue']);
        add_action('admin_menu', [__CLASS__, 'admin_menu']);

        // Validación y reservas en checkout
        add_action('woocommerce_checkout_process', [__CLASS__, 'checkout_capacity_guard_global']);
        add_action('template_redirect', [__CLASS__, 'maybe_start_hold']);
        add_action('woocommerce_checkout_create_order', [__CLASS__, 'checkout_save_order_capacity'], 20, 2);

        // Producto
        add_action('woocommerce_before_add_to_cart_button', [__CLASS__, 'product_field'], 20);
        add_filter('woocommerce_add_to_cart_validation', [__CLASS__, 'validate_add_to_cart'], 10, 3);
        add_filter('woocommerce_add_cart_item_data', [__CLASS__, 'add_cart_item_data'], 10, 3);
        add_filter('woocommerce_get_item_data', [__CLASS__, 'display_cart_item_data'], 10, 2);
        add_action('woocommerce_checkout_create_order_line_item', [__CLASS__, 'order_line_item_meta'], 10, 4);

        // Checkout (opcional)
        add_filter('woocommerce_checkout_fields', [__CLASS__, 'checkout_field']);
        add_action('woocommerce_checkout_process', [__CLASS__, 'checkout_validate']);
        add_action('woocommerce_checkout_create_order', [__CLASS__, 'checkout_save_order_meta'], 10, 2);
        add_action('woocommerce_admin_order_data_after_billing_address', [__CLASS__, 'admin_order_meta']);
        add_filter('woocommerce_email_order_meta_fields', [__CLASS__, 'email_meta'], 10, 3);
    }
}

add_action('init', function(){ WCPDD::hooks(); });

/** =======================
 *  RESERVAS (Holds) tipo cine
 *  ======================= */

/**
 * Estructura de reserva:
 * option_name: wcpdd_hold_{key}
 * value: ['qty_total'=>int, 'dates'=>['Y-m-d'=>int], 'expires'=>timestamp]
 * Índice de reservas activas: option 'wcpdd_holds_idx' => array de keys
 */

// Clave de sesión para reserva
function wcpdd_session_key() {
    if ( function_exists('WC') && WC()->session ) {
        $id = WC()->session->get_customer_id();
        if ( $id ) return 'wc_'.$id;
    }
    if ( isset($_COOKIE['wp_woocommerce_session_'.COOKIEHASH]) ) {
        return 'cookie_'.md5($_COOKIE['wp_woocommerce_session_'.COOKIEHASH]);
    }
    return 'anon_'.md5( ( session_id() ?: ( $_SERVER['REMOTE_ADDR'] ?? microtime(true) ) ) );
}

// Obtener reservas activas y limpiar expiradas
function wcpdd_get_active_holds() {
    $idx = get_option('wcpdd_holds_idx', []);
    $now = time();
    $active = [];
    $changed = false;
    foreach ($idx as $k) {
        $hold = get_option('wcpdd_hold_'.$k);
        if ( ! $hold || empty($hold['expires']) || $hold['expires'] < $now ) {
            delete_option('wcpdd_hold_'.$k);
            $changed = true;
            continue;
        }
        $active[$k] = $hold;
    }
    if ($changed) {
        update_option('wcpdd_holds_idx', array_keys($active), false);
    }
    return $active;
}

// Crear/actualizar reserva para la sesión actual
function wcpdd_upsert_hold_for_current_session( $ttl_minutes = 15 ) {
    if ( ! function_exists('WC') || ! WC()->cart ) return;
    $key = wcpdd_session_key();
    $qty_total = 0; $dates = [];
    foreach ( WC()->cart->get_cart() as $item ) {
        $qty = intval($item['quantity']);
        $qty_total += $qty;
        $d = isset($item['wcpdd_delivery_date']) ? $item['wcpdd_delivery_date'] : null;
        if ($d) {
            if (!isset($dates[$d])) $dates[$d]=0;
            $dates[$d] += $qty;
        }
    }
    $hold = [
        'qty_total' => max(0,$qty_total),
        'dates'     => $dates,
        'expires'   => time() + max(60, $ttl_minutes*60),
    ];
    update_option('wcpdd_hold_'.$key, $hold, false);
    $idx = get_option('wcpdd_holds_idx', []);
    if ( ! in_array($key, $idx, true) ) {
        $idx[] = $key;
        update_option('wcpdd_holds_idx', $idx, false);
    }
}

// Limpiar reserva de la sesión (al completar pedido)
function wcpdd_clear_hold_for_current_session() {
    $key = wcpdd_session_key();
    delete_option('wcpdd_hold_'.$key);
    $idx = get_option('wcpdd_holds_idx', []);
    $idx = array_values(array_diff($idx, [$key]));
    update_option('wcpdd_holds_idx', $idx, false);
}

/** ==== AJAX: cupo global restante (considera pedidos + reservas) ==== */
add_action('wp_ajax_wcpdd_remaining_global', 'wcpdd_remaining_global');
add_action('wp_ajax_nopriv_wcpdd_remaining_global', 'wcpdd_remaining_global');
function wcpdd_remaining_global() {
    $cap  = WCPDD::get_global_capacity();
    $used = WCPDD::get_global_used_units();
    wp_send_json_success([
        'capacity'  => intval($cap),
        'used'      => intval($used),
        'remaining' => max(0, $cap - $used),
    ]);
}



