
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    // unfortunately this can't be a constant as that wouldn't be tree-shakeable
    // so we cache the result instead
    let crossorigin;
    function is_crossorigin() {
        if (crossorigin === undefined) {
            crossorigin = false;
            try {
                if (typeof window !== 'undefined' && window.parent) {
                    void window.parent.document;
                }
            }
            catch (error) {
                crossorigin = true;
            }
        }
        return crossorigin;
    }
    function add_resize_listener(node, fn) {
        const computed_style = getComputedStyle(node);
        if (computed_style.position === 'static') {
            node.style.position = 'relative';
        }
        const iframe = element('iframe');
        iframe.setAttribute('style', 'display: block; position: absolute; top: 0; left: 0; width: 100%; height: 100%; ' +
            'overflow: hidden; border: 0; opacity: 0; pointer-events: none; z-index: -1;');
        iframe.setAttribute('aria-hidden', 'true');
        iframe.tabIndex = -1;
        const crossorigin = is_crossorigin();
        let unsubscribe;
        if (crossorigin) {
            iframe.src = "data:text/html,<script>onresize=function(){parent.postMessage(0,'*')}</script>";
            unsubscribe = listen(window, 'message', (event) => {
                if (event.source === iframe.contentWindow)
                    fn();
            });
        }
        else {
            iframe.src = 'about:blank';
            iframe.onload = () => {
                unsubscribe = listen(iframe.contentWindow, 'resize', fn);
            };
        }
        append(node, iframe);
        return () => {
            if (crossorigin) {
                unsubscribe();
            }
            else if (unsubscribe && iframe.contentWindow) {
                unsubscribe();
            }
            detach(iframe);
        };
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.32.2' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    /* --------------------------------------------
     *
     * Return a truthy value if is zero
     *
     * --------------------------------------------
     */
    function canBeZero (val) {
    	if (val === 0) {
    		return true;
    	}
    	return val;
    }

    function makeAccessor (acc) {
    	if (!canBeZero(acc)) return null;
    	if (Array.isArray(acc)) {
    		return d => acc.map(k => {
    			return typeof k !== 'function' ? d[k] : k(d);
    		});
    	} else if (typeof acc !== 'function') { // eslint-disable-line no-else-return
    		return d => d[acc];
    	}
    	return acc;
    }

    /* --------------------------------------------
     *
     * Remove undefined fields from an object
     *
     * --------------------------------------------
     */

    // From Object.fromEntries polyfill https://github.com/tc39/proposal-object-from-entries/blob/master/polyfill.js#L1
    function fromEntries(iter) {
    	const obj = {};

    	for (const pair of iter) {
    		if (Object(pair) !== pair) {
    			throw new TypeError("iterable for fromEntries should yield objects");
    		}

    		// Consistency with Map: contract is that entry has "0" and "1" keys, not
    		// that it is an array or iterable.

    		const { "0": key, "1": val } = pair;

    		Object.defineProperty(obj, key, {
    			configurable: true,
    			enumerable: true,
    			writable: true,
    			value: val,
    		});
    	}

    	return obj;
    }

    function filterObject (obj, comparisonObj = {}) {
    	return fromEntries(Object.entries(obj).filter(([key, value]) => {
    		return value !== undefined
    			&& comparisonObj[key] === undefined;
    	}));
    }

    /* --------------------------------------------
     *
     * Calculate the extents of desired fields
     * For example, a fields object like this:
     * `{'x': d => d.x, 'y': d => d.y}`
     * For data like this:
     * [{ x: 0, y: -10 }, { x: 10, y: 0 }, { x: 5, y: 10 }]
     * Returns an object like:
     * `{ x: [0, 10], y: [-10, 10] }`
     *
     * --------------------------------------------
     */
    function calcExtents (data, fields) {
    	if (!Array.isArray(data)) {
    		throw new TypeError('The first argument of calcExtents() must be an array.');
    	}

    	if (
    		Array.isArray(fields)
    		|| fields === undefined
    		|| fields === null
    	) {
    		throw new TypeError('The second argument of calcExtents() must be an '
    		+ 'object with field names as keys as accessor functions as values.');
    	}

    	const extents = {};

    	const keys = Object.keys(fields);
    	const kl = keys.length;
    	let i;
    	let j;
    	let k;
    	let s;
    	let min;
    	let max;
    	let acc;
    	let val;

    	const dl = data.length;
    	for (i = 0; i < kl; i += 1) {
    		s = keys[i];
    		acc = fields[s];
    		min = null;
    		max = null;
    		for (j = 0; j < dl; j += 1) {
    			val = acc(data[j]);
    			if (Array.isArray(val)) {
    				const vl = val.length;
    				for (k = 0; k < vl; k += 1) {
    					if (val[k] !== undefined && val[k] !== null && Number.isNaN(val[k]) === false) {
    						if (min === null || val[k] < min) {
    							min = val[k];
    						}
    						if (max === null || val[k] > max) {
    							max = val[k];
    						}
    					}
    				}
    			} else if (val !== undefined && val !== null && Number.isNaN(val) === false) {
    				if (min === null || val < min) {
    					min = val;
    				}
    				if (max === null || val > max) {
    					max = val;
    				}
    			}
    		}
    		extents[s] = [min, max];
    	}

    	return extents;
    }

    /* --------------------------------------------
     * If we have a domain from settings, fill in
     * any null values with ones from our measured extents
     * otherwise, return the measured extent
     */
    function partialDomain (domain = [], directive) {
    	if (Array.isArray(directive) === true) {
    		return directive.map((d, i) => {
    			if (d === null) {
    				return domain[i];
    			}
    			return d;
    		});
    	}
    	return domain;
    }

    function calcDomain (s) {
    	return function domainCalc ([$extents, $domain]) {
    		return $extents ? partialDomain($extents[s], $domain) : $domain;
    	};
    }

    function ascending(a, b) {
      return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
    }

    function bisector(f) {
      let delta = f;
      let compare = f;

      if (f.length === 1) {
        delta = (d, x) => f(d) - x;
        compare = ascendingComparator(f);
      }

      function left(a, x, lo, hi) {
        if (lo == null) lo = 0;
        if (hi == null) hi = a.length;
        while (lo < hi) {
          const mid = (lo + hi) >>> 1;
          if (compare(a[mid], x) < 0) lo = mid + 1;
          else hi = mid;
        }
        return lo;
      }

      function right(a, x, lo, hi) {
        if (lo == null) lo = 0;
        if (hi == null) hi = a.length;
        while (lo < hi) {
          const mid = (lo + hi) >>> 1;
          if (compare(a[mid], x) > 0) hi = mid;
          else lo = mid + 1;
        }
        return lo;
      }

      function center(a, x, lo, hi) {
        if (lo == null) lo = 0;
        if (hi == null) hi = a.length;
        const i = left(a, x, lo, hi - 1);
        return i > lo && delta(a[i - 1], x) > -delta(a[i], x) ? i - 1 : i;
      }

      return {left, center, right};
    }

    function ascendingComparator(f) {
      return (d, x) => ascending(f(d), x);
    }

    function number(x) {
      return x === null ? NaN : +x;
    }

    const ascendingBisect = bisector(ascending);
    const bisectRight = ascendingBisect.right;
    bisector(number).center;

    var e10 = Math.sqrt(50),
        e5 = Math.sqrt(10),
        e2 = Math.sqrt(2);

    function ticks(start, stop, count) {
      var reverse,
          i = -1,
          n,
          ticks,
          step;

      stop = +stop, start = +start, count = +count;
      if (start === stop && count > 0) return [start];
      if (reverse = stop < start) n = start, start = stop, stop = n;
      if ((step = tickIncrement(start, stop, count)) === 0 || !isFinite(step)) return [];

      if (step > 0) {
        start = Math.ceil(start / step);
        stop = Math.floor(stop / step);
        ticks = new Array(n = Math.ceil(stop - start + 1));
        while (++i < n) ticks[i] = (start + i) * step;
      } else {
        step = -step;
        start = Math.ceil(start * step);
        stop = Math.floor(stop * step);
        ticks = new Array(n = Math.ceil(stop - start + 1));
        while (++i < n) ticks[i] = (start + i) / step;
      }

      if (reverse) ticks.reverse();

      return ticks;
    }

    function tickIncrement(start, stop, count) {
      var step = (stop - start) / Math.max(0, count),
          power = Math.floor(Math.log(step) / Math.LN10),
          error = step / Math.pow(10, power);
      return power >= 0
          ? (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1) * Math.pow(10, power)
          : -Math.pow(10, -power) / (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1);
    }

    function tickStep(start, stop, count) {
      var step0 = Math.abs(stop - start) / Math.max(0, count),
          step1 = Math.pow(10, Math.floor(Math.log(step0) / Math.LN10)),
          error = step0 / step1;
      if (error >= e10) step1 *= 10;
      else if (error >= e5) step1 *= 5;
      else if (error >= e2) step1 *= 2;
      return stop < start ? -step1 : step1;
    }

    function max(values, valueof) {
      let max;
      if (valueof === undefined) {
        for (const value of values) {
          if (value != null
              && (max < value || (max === undefined && value >= value))) {
            max = value;
          }
        }
      } else {
        let index = -1;
        for (let value of values) {
          if ((value = valueof(value, ++index, values)) != null
              && (max < value || (max === undefined && value >= value))) {
            max = value;
          }
        }
      }
      return max;
    }

    function initRange(domain, range) {
      switch (arguments.length) {
        case 0: break;
        case 1: this.range(domain); break;
        default: this.range(range).domain(domain); break;
      }
      return this;
    }

    const implicit = Symbol("implicit");

    function ordinal() {
      var index = new Map(),
          domain = [],
          range = [],
          unknown = implicit;

      function scale(d) {
        var key = d + "", i = index.get(key);
        if (!i) {
          if (unknown !== implicit) return unknown;
          index.set(key, i = domain.push(d));
        }
        return range[(i - 1) % range.length];
      }

      scale.domain = function(_) {
        if (!arguments.length) return domain.slice();
        domain = [], index = new Map();
        for (const value of _) {
          const key = value + "";
          if (index.has(key)) continue;
          index.set(key, domain.push(value));
        }
        return scale;
      };

      scale.range = function(_) {
        return arguments.length ? (range = Array.from(_), scale) : range.slice();
      };

      scale.unknown = function(_) {
        return arguments.length ? (unknown = _, scale) : unknown;
      };

      scale.copy = function() {
        return ordinal(domain, range).unknown(unknown);
      };

      initRange.apply(scale, arguments);

      return scale;
    }

    function define(constructor, factory, prototype) {
      constructor.prototype = factory.prototype = prototype;
      prototype.constructor = constructor;
    }

    function extend(parent, definition) {
      var prototype = Object.create(parent.prototype);
      for (var key in definition) prototype[key] = definition[key];
      return prototype;
    }

    function Color() {}

    var darker = 0.7;
    var brighter = 1 / darker;

    var reI = "\\s*([+-]?\\d+)\\s*",
        reN = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)\\s*",
        reP = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)%\\s*",
        reHex = /^#([0-9a-f]{3,8})$/,
        reRgbInteger = new RegExp("^rgb\\(" + [reI, reI, reI] + "\\)$"),
        reRgbPercent = new RegExp("^rgb\\(" + [reP, reP, reP] + "\\)$"),
        reRgbaInteger = new RegExp("^rgba\\(" + [reI, reI, reI, reN] + "\\)$"),
        reRgbaPercent = new RegExp("^rgba\\(" + [reP, reP, reP, reN] + "\\)$"),
        reHslPercent = new RegExp("^hsl\\(" + [reN, reP, reP] + "\\)$"),
        reHslaPercent = new RegExp("^hsla\\(" + [reN, reP, reP, reN] + "\\)$");

    var named = {
      aliceblue: 0xf0f8ff,
      antiquewhite: 0xfaebd7,
      aqua: 0x00ffff,
      aquamarine: 0x7fffd4,
      azure: 0xf0ffff,
      beige: 0xf5f5dc,
      bisque: 0xffe4c4,
      black: 0x000000,
      blanchedalmond: 0xffebcd,
      blue: 0x0000ff,
      blueviolet: 0x8a2be2,
      brown: 0xa52a2a,
      burlywood: 0xdeb887,
      cadetblue: 0x5f9ea0,
      chartreuse: 0x7fff00,
      chocolate: 0xd2691e,
      coral: 0xff7f50,
      cornflowerblue: 0x6495ed,
      cornsilk: 0xfff8dc,
      crimson: 0xdc143c,
      cyan: 0x00ffff,
      darkblue: 0x00008b,
      darkcyan: 0x008b8b,
      darkgoldenrod: 0xb8860b,
      darkgray: 0xa9a9a9,
      darkgreen: 0x006400,
      darkgrey: 0xa9a9a9,
      darkkhaki: 0xbdb76b,
      darkmagenta: 0x8b008b,
      darkolivegreen: 0x556b2f,
      darkorange: 0xff8c00,
      darkorchid: 0x9932cc,
      darkred: 0x8b0000,
      darksalmon: 0xe9967a,
      darkseagreen: 0x8fbc8f,
      darkslateblue: 0x483d8b,
      darkslategray: 0x2f4f4f,
      darkslategrey: 0x2f4f4f,
      darkturquoise: 0x00ced1,
      darkviolet: 0x9400d3,
      deeppink: 0xff1493,
      deepskyblue: 0x00bfff,
      dimgray: 0x696969,
      dimgrey: 0x696969,
      dodgerblue: 0x1e90ff,
      firebrick: 0xb22222,
      floralwhite: 0xfffaf0,
      forestgreen: 0x228b22,
      fuchsia: 0xff00ff,
      gainsboro: 0xdcdcdc,
      ghostwhite: 0xf8f8ff,
      gold: 0xffd700,
      goldenrod: 0xdaa520,
      gray: 0x808080,
      green: 0x008000,
      greenyellow: 0xadff2f,
      grey: 0x808080,
      honeydew: 0xf0fff0,
      hotpink: 0xff69b4,
      indianred: 0xcd5c5c,
      indigo: 0x4b0082,
      ivory: 0xfffff0,
      khaki: 0xf0e68c,
      lavender: 0xe6e6fa,
      lavenderblush: 0xfff0f5,
      lawngreen: 0x7cfc00,
      lemonchiffon: 0xfffacd,
      lightblue: 0xadd8e6,
      lightcoral: 0xf08080,
      lightcyan: 0xe0ffff,
      lightgoldenrodyellow: 0xfafad2,
      lightgray: 0xd3d3d3,
      lightgreen: 0x90ee90,
      lightgrey: 0xd3d3d3,
      lightpink: 0xffb6c1,
      lightsalmon: 0xffa07a,
      lightseagreen: 0x20b2aa,
      lightskyblue: 0x87cefa,
      lightslategray: 0x778899,
      lightslategrey: 0x778899,
      lightsteelblue: 0xb0c4de,
      lightyellow: 0xffffe0,
      lime: 0x00ff00,
      limegreen: 0x32cd32,
      linen: 0xfaf0e6,
      magenta: 0xff00ff,
      maroon: 0x800000,
      mediumaquamarine: 0x66cdaa,
      mediumblue: 0x0000cd,
      mediumorchid: 0xba55d3,
      mediumpurple: 0x9370db,
      mediumseagreen: 0x3cb371,
      mediumslateblue: 0x7b68ee,
      mediumspringgreen: 0x00fa9a,
      mediumturquoise: 0x48d1cc,
      mediumvioletred: 0xc71585,
      midnightblue: 0x191970,
      mintcream: 0xf5fffa,
      mistyrose: 0xffe4e1,
      moccasin: 0xffe4b5,
      navajowhite: 0xffdead,
      navy: 0x000080,
      oldlace: 0xfdf5e6,
      olive: 0x808000,
      olivedrab: 0x6b8e23,
      orange: 0xffa500,
      orangered: 0xff4500,
      orchid: 0xda70d6,
      palegoldenrod: 0xeee8aa,
      palegreen: 0x98fb98,
      paleturquoise: 0xafeeee,
      palevioletred: 0xdb7093,
      papayawhip: 0xffefd5,
      peachpuff: 0xffdab9,
      peru: 0xcd853f,
      pink: 0xffc0cb,
      plum: 0xdda0dd,
      powderblue: 0xb0e0e6,
      purple: 0x800080,
      rebeccapurple: 0x663399,
      red: 0xff0000,
      rosybrown: 0xbc8f8f,
      royalblue: 0x4169e1,
      saddlebrown: 0x8b4513,
      salmon: 0xfa8072,
      sandybrown: 0xf4a460,
      seagreen: 0x2e8b57,
      seashell: 0xfff5ee,
      sienna: 0xa0522d,
      silver: 0xc0c0c0,
      skyblue: 0x87ceeb,
      slateblue: 0x6a5acd,
      slategray: 0x708090,
      slategrey: 0x708090,
      snow: 0xfffafa,
      springgreen: 0x00ff7f,
      steelblue: 0x4682b4,
      tan: 0xd2b48c,
      teal: 0x008080,
      thistle: 0xd8bfd8,
      tomato: 0xff6347,
      turquoise: 0x40e0d0,
      violet: 0xee82ee,
      wheat: 0xf5deb3,
      white: 0xffffff,
      whitesmoke: 0xf5f5f5,
      yellow: 0xffff00,
      yellowgreen: 0x9acd32
    };

    define(Color, color, {
      copy: function(channels) {
        return Object.assign(new this.constructor, this, channels);
      },
      displayable: function() {
        return this.rgb().displayable();
      },
      hex: color_formatHex, // Deprecated! Use color.formatHex.
      formatHex: color_formatHex,
      formatHsl: color_formatHsl,
      formatRgb: color_formatRgb,
      toString: color_formatRgb
    });

    function color_formatHex() {
      return this.rgb().formatHex();
    }

    function color_formatHsl() {
      return hslConvert(this).formatHsl();
    }

    function color_formatRgb() {
      return this.rgb().formatRgb();
    }

    function color(format) {
      var m, l;
      format = (format + "").trim().toLowerCase();
      return (m = reHex.exec(format)) ? (l = m[1].length, m = parseInt(m[1], 16), l === 6 ? rgbn(m) // #ff0000
          : l === 3 ? new Rgb((m >> 8 & 0xf) | (m >> 4 & 0xf0), (m >> 4 & 0xf) | (m & 0xf0), ((m & 0xf) << 4) | (m & 0xf), 1) // #f00
          : l === 8 ? rgba(m >> 24 & 0xff, m >> 16 & 0xff, m >> 8 & 0xff, (m & 0xff) / 0xff) // #ff000000
          : l === 4 ? rgba((m >> 12 & 0xf) | (m >> 8 & 0xf0), (m >> 8 & 0xf) | (m >> 4 & 0xf0), (m >> 4 & 0xf) | (m & 0xf0), (((m & 0xf) << 4) | (m & 0xf)) / 0xff) // #f000
          : null) // invalid hex
          : (m = reRgbInteger.exec(format)) ? new Rgb(m[1], m[2], m[3], 1) // rgb(255, 0, 0)
          : (m = reRgbPercent.exec(format)) ? new Rgb(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, 1) // rgb(100%, 0%, 0%)
          : (m = reRgbaInteger.exec(format)) ? rgba(m[1], m[2], m[3], m[4]) // rgba(255, 0, 0, 1)
          : (m = reRgbaPercent.exec(format)) ? rgba(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, m[4]) // rgb(100%, 0%, 0%, 1)
          : (m = reHslPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, 1) // hsl(120, 50%, 50%)
          : (m = reHslaPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, m[4]) // hsla(120, 50%, 50%, 1)
          : named.hasOwnProperty(format) ? rgbn(named[format]) // eslint-disable-line no-prototype-builtins
          : format === "transparent" ? new Rgb(NaN, NaN, NaN, 0)
          : null;
    }

    function rgbn(n) {
      return new Rgb(n >> 16 & 0xff, n >> 8 & 0xff, n & 0xff, 1);
    }

    function rgba(r, g, b, a) {
      if (a <= 0) r = g = b = NaN;
      return new Rgb(r, g, b, a);
    }

    function rgbConvert(o) {
      if (!(o instanceof Color)) o = color(o);
      if (!o) return new Rgb;
      o = o.rgb();
      return new Rgb(o.r, o.g, o.b, o.opacity);
    }

    function rgb(r, g, b, opacity) {
      return arguments.length === 1 ? rgbConvert(r) : new Rgb(r, g, b, opacity == null ? 1 : opacity);
    }

    function Rgb(r, g, b, opacity) {
      this.r = +r;
      this.g = +g;
      this.b = +b;
      this.opacity = +opacity;
    }

    define(Rgb, rgb, extend(Color, {
      brighter: function(k) {
        k = k == null ? brighter : Math.pow(brighter, k);
        return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
      },
      darker: function(k) {
        k = k == null ? darker : Math.pow(darker, k);
        return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
      },
      rgb: function() {
        return this;
      },
      displayable: function() {
        return (-0.5 <= this.r && this.r < 255.5)
            && (-0.5 <= this.g && this.g < 255.5)
            && (-0.5 <= this.b && this.b < 255.5)
            && (0 <= this.opacity && this.opacity <= 1);
      },
      hex: rgb_formatHex, // Deprecated! Use color.formatHex.
      formatHex: rgb_formatHex,
      formatRgb: rgb_formatRgb,
      toString: rgb_formatRgb
    }));

    function rgb_formatHex() {
      return "#" + hex(this.r) + hex(this.g) + hex(this.b);
    }

    function rgb_formatRgb() {
      var a = this.opacity; a = isNaN(a) ? 1 : Math.max(0, Math.min(1, a));
      return (a === 1 ? "rgb(" : "rgba(")
          + Math.max(0, Math.min(255, Math.round(this.r) || 0)) + ", "
          + Math.max(0, Math.min(255, Math.round(this.g) || 0)) + ", "
          + Math.max(0, Math.min(255, Math.round(this.b) || 0))
          + (a === 1 ? ")" : ", " + a + ")");
    }

    function hex(value) {
      value = Math.max(0, Math.min(255, Math.round(value) || 0));
      return (value < 16 ? "0" : "") + value.toString(16);
    }

    function hsla(h, s, l, a) {
      if (a <= 0) h = s = l = NaN;
      else if (l <= 0 || l >= 1) h = s = NaN;
      else if (s <= 0) h = NaN;
      return new Hsl(h, s, l, a);
    }

    function hslConvert(o) {
      if (o instanceof Hsl) return new Hsl(o.h, o.s, o.l, o.opacity);
      if (!(o instanceof Color)) o = color(o);
      if (!o) return new Hsl;
      if (o instanceof Hsl) return o;
      o = o.rgb();
      var r = o.r / 255,
          g = o.g / 255,
          b = o.b / 255,
          min = Math.min(r, g, b),
          max = Math.max(r, g, b),
          h = NaN,
          s = max - min,
          l = (max + min) / 2;
      if (s) {
        if (r === max) h = (g - b) / s + (g < b) * 6;
        else if (g === max) h = (b - r) / s + 2;
        else h = (r - g) / s + 4;
        s /= l < 0.5 ? max + min : 2 - max - min;
        h *= 60;
      } else {
        s = l > 0 && l < 1 ? 0 : h;
      }
      return new Hsl(h, s, l, o.opacity);
    }

    function hsl(h, s, l, opacity) {
      return arguments.length === 1 ? hslConvert(h) : new Hsl(h, s, l, opacity == null ? 1 : opacity);
    }

    function Hsl(h, s, l, opacity) {
      this.h = +h;
      this.s = +s;
      this.l = +l;
      this.opacity = +opacity;
    }

    define(Hsl, hsl, extend(Color, {
      brighter: function(k) {
        k = k == null ? brighter : Math.pow(brighter, k);
        return new Hsl(this.h, this.s, this.l * k, this.opacity);
      },
      darker: function(k) {
        k = k == null ? darker : Math.pow(darker, k);
        return new Hsl(this.h, this.s, this.l * k, this.opacity);
      },
      rgb: function() {
        var h = this.h % 360 + (this.h < 0) * 360,
            s = isNaN(h) || isNaN(this.s) ? 0 : this.s,
            l = this.l,
            m2 = l + (l < 0.5 ? l : 1 - l) * s,
            m1 = 2 * l - m2;
        return new Rgb(
          hsl2rgb(h >= 240 ? h - 240 : h + 120, m1, m2),
          hsl2rgb(h, m1, m2),
          hsl2rgb(h < 120 ? h + 240 : h - 120, m1, m2),
          this.opacity
        );
      },
      displayable: function() {
        return (0 <= this.s && this.s <= 1 || isNaN(this.s))
            && (0 <= this.l && this.l <= 1)
            && (0 <= this.opacity && this.opacity <= 1);
      },
      formatHsl: function() {
        var a = this.opacity; a = isNaN(a) ? 1 : Math.max(0, Math.min(1, a));
        return (a === 1 ? "hsl(" : "hsla(")
            + (this.h || 0) + ", "
            + (this.s || 0) * 100 + "%, "
            + (this.l || 0) * 100 + "%"
            + (a === 1 ? ")" : ", " + a + ")");
      }
    }));

    /* From FvD 13.37, CSS Color Module Level 3 */
    function hsl2rgb(h, m1, m2) {
      return (h < 60 ? m1 + (m2 - m1) * h / 60
          : h < 180 ? m2
          : h < 240 ? m1 + (m2 - m1) * (240 - h) / 60
          : m1) * 255;
    }

    var constant = x => () => x;

    function linear(a, d) {
      return function(t) {
        return a + t * d;
      };
    }

    function exponential(a, b, y) {
      return a = Math.pow(a, y), b = Math.pow(b, y) - a, y = 1 / y, function(t) {
        return Math.pow(a + t * b, y);
      };
    }

    function gamma(y) {
      return (y = +y) === 1 ? nogamma : function(a, b) {
        return b - a ? exponential(a, b, y) : constant(isNaN(a) ? b : a);
      };
    }

    function nogamma(a, b) {
      var d = b - a;
      return d ? linear(a, d) : constant(isNaN(a) ? b : a);
    }

    var rgb$1 = (function rgbGamma(y) {
      var color = gamma(y);

      function rgb$1(start, end) {
        var r = color((start = rgb(start)).r, (end = rgb(end)).r),
            g = color(start.g, end.g),
            b = color(start.b, end.b),
            opacity = nogamma(start.opacity, end.opacity);
        return function(t) {
          start.r = r(t);
          start.g = g(t);
          start.b = b(t);
          start.opacity = opacity(t);
          return start + "";
        };
      }

      rgb$1.gamma = rgbGamma;

      return rgb$1;
    })(1);

    function numberArray(a, b) {
      if (!b) b = [];
      var n = a ? Math.min(b.length, a.length) : 0,
          c = b.slice(),
          i;
      return function(t) {
        for (i = 0; i < n; ++i) c[i] = a[i] * (1 - t) + b[i] * t;
        return c;
      };
    }

    function isNumberArray(x) {
      return ArrayBuffer.isView(x) && !(x instanceof DataView);
    }

    function genericArray(a, b) {
      var nb = b ? b.length : 0,
          na = a ? Math.min(nb, a.length) : 0,
          x = new Array(na),
          c = new Array(nb),
          i;

      for (i = 0; i < na; ++i) x[i] = interpolate(a[i], b[i]);
      for (; i < nb; ++i) c[i] = b[i];

      return function(t) {
        for (i = 0; i < na; ++i) c[i] = x[i](t);
        return c;
      };
    }

    function date(a, b) {
      var d = new Date;
      return a = +a, b = +b, function(t) {
        return d.setTime(a * (1 - t) + b * t), d;
      };
    }

    function interpolateNumber(a, b) {
      return a = +a, b = +b, function(t) {
        return a * (1 - t) + b * t;
      };
    }

    function object(a, b) {
      var i = {},
          c = {},
          k;

      if (a === null || typeof a !== "object") a = {};
      if (b === null || typeof b !== "object") b = {};

      for (k in b) {
        if (k in a) {
          i[k] = interpolate(a[k], b[k]);
        } else {
          c[k] = b[k];
        }
      }

      return function(t) {
        for (k in i) c[k] = i[k](t);
        return c;
      };
    }

    var reA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g,
        reB = new RegExp(reA.source, "g");

    function zero(b) {
      return function() {
        return b;
      };
    }

    function one(b) {
      return function(t) {
        return b(t) + "";
      };
    }

    function string(a, b) {
      var bi = reA.lastIndex = reB.lastIndex = 0, // scan index for next number in b
          am, // current match in a
          bm, // current match in b
          bs, // string preceding current number in b, if any
          i = -1, // index in s
          s = [], // string constants and placeholders
          q = []; // number interpolators

      // Coerce inputs to strings.
      a = a + "", b = b + "";

      // Interpolate pairs of numbers in a & b.
      while ((am = reA.exec(a))
          && (bm = reB.exec(b))) {
        if ((bs = bm.index) > bi) { // a string precedes the next number in b
          bs = b.slice(bi, bs);
          if (s[i]) s[i] += bs; // coalesce with previous string
          else s[++i] = bs;
        }
        if ((am = am[0]) === (bm = bm[0])) { // numbers in a & b match
          if (s[i]) s[i] += bm; // coalesce with previous string
          else s[++i] = bm;
        } else { // interpolate non-matching numbers
          s[++i] = null;
          q.push({i: i, x: interpolateNumber(am, bm)});
        }
        bi = reB.lastIndex;
      }

      // Add remains of b.
      if (bi < b.length) {
        bs = b.slice(bi);
        if (s[i]) s[i] += bs; // coalesce with previous string
        else s[++i] = bs;
      }

      // Special optimization for only a single match.
      // Otherwise, interpolate each of the numbers and rejoin the string.
      return s.length < 2 ? (q[0]
          ? one(q[0].x)
          : zero(b))
          : (b = q.length, function(t) {
              for (var i = 0, o; i < b; ++i) s[(o = q[i]).i] = o.x(t);
              return s.join("");
            });
    }

    function interpolate(a, b) {
      var t = typeof b, c;
      return b == null || t === "boolean" ? constant(b)
          : (t === "number" ? interpolateNumber
          : t === "string" ? ((c = color(b)) ? (b = c, rgb$1) : string)
          : b instanceof color ? rgb$1
          : b instanceof Date ? date
          : isNumberArray(b) ? numberArray
          : Array.isArray(b) ? genericArray
          : typeof b.valueOf !== "function" && typeof b.toString !== "function" || isNaN(b) ? object
          : interpolateNumber)(a, b);
    }

    function interpolateRound(a, b) {
      return a = +a, b = +b, function(t) {
        return Math.round(a * (1 - t) + b * t);
      };
    }

    function constants(x) {
      return function() {
        return x;
      };
    }

    function number$1(x) {
      return +x;
    }

    var unit = [0, 1];

    function identity(x) {
      return x;
    }

    function normalize(a, b) {
      return (b -= (a = +a))
          ? function(x) { return (x - a) / b; }
          : constants(isNaN(b) ? NaN : 0.5);
    }

    function clamper(a, b) {
      var t;
      if (a > b) t = a, a = b, b = t;
      return function(x) { return Math.max(a, Math.min(b, x)); };
    }

    // normalize(a, b)(x) takes a domain value x in [a,b] and returns the corresponding parameter t in [0,1].
    // interpolate(a, b)(t) takes a parameter t in [0,1] and returns the corresponding range value x in [a,b].
    function bimap(domain, range, interpolate) {
      var d0 = domain[0], d1 = domain[1], r0 = range[0], r1 = range[1];
      if (d1 < d0) d0 = normalize(d1, d0), r0 = interpolate(r1, r0);
      else d0 = normalize(d0, d1), r0 = interpolate(r0, r1);
      return function(x) { return r0(d0(x)); };
    }

    function polymap(domain, range, interpolate) {
      var j = Math.min(domain.length, range.length) - 1,
          d = new Array(j),
          r = new Array(j),
          i = -1;

      // Reverse descending domains.
      if (domain[j] < domain[0]) {
        domain = domain.slice().reverse();
        range = range.slice().reverse();
      }

      while (++i < j) {
        d[i] = normalize(domain[i], domain[i + 1]);
        r[i] = interpolate(range[i], range[i + 1]);
      }

      return function(x) {
        var i = bisectRight(domain, x, 1, j) - 1;
        return r[i](d[i](x));
      };
    }

    function copy(source, target) {
      return target
          .domain(source.domain())
          .range(source.range())
          .interpolate(source.interpolate())
          .clamp(source.clamp())
          .unknown(source.unknown());
    }

    function transformer() {
      var domain = unit,
          range = unit,
          interpolate$1 = interpolate,
          transform,
          untransform,
          unknown,
          clamp = identity,
          piecewise,
          output,
          input;

      function rescale() {
        var n = Math.min(domain.length, range.length);
        if (clamp !== identity) clamp = clamper(domain[0], domain[n - 1]);
        piecewise = n > 2 ? polymap : bimap;
        output = input = null;
        return scale;
      }

      function scale(x) {
        return isNaN(x = +x) ? unknown : (output || (output = piecewise(domain.map(transform), range, interpolate$1)))(transform(clamp(x)));
      }

      scale.invert = function(y) {
        return clamp(untransform((input || (input = piecewise(range, domain.map(transform), interpolateNumber)))(y)));
      };

      scale.domain = function(_) {
        return arguments.length ? (domain = Array.from(_, number$1), rescale()) : domain.slice();
      };

      scale.range = function(_) {
        return arguments.length ? (range = Array.from(_), rescale()) : range.slice();
      };

      scale.rangeRound = function(_) {
        return range = Array.from(_), interpolate$1 = interpolateRound, rescale();
      };

      scale.clamp = function(_) {
        return arguments.length ? (clamp = _ ? true : identity, rescale()) : clamp !== identity;
      };

      scale.interpolate = function(_) {
        return arguments.length ? (interpolate$1 = _, rescale()) : interpolate$1;
      };

      scale.unknown = function(_) {
        return arguments.length ? (unknown = _, scale) : unknown;
      };

      return function(t, u) {
        transform = t, untransform = u;
        return rescale();
      };
    }

    function continuous() {
      return transformer()(identity, identity);
    }

    function formatDecimal(x) {
      return Math.abs(x = Math.round(x)) >= 1e21
          ? x.toLocaleString("en").replace(/,/g, "")
          : x.toString(10);
    }

    // Computes the decimal coefficient and exponent of the specified number x with
    // significant digits p, where x is positive and p is in [1, 21] or undefined.
    // For example, formatDecimalParts(1.23) returns ["123", 0].
    function formatDecimalParts(x, p) {
      if ((i = (x = p ? x.toExponential(p - 1) : x.toExponential()).indexOf("e")) < 0) return null; // NaN, ±Infinity
      var i, coefficient = x.slice(0, i);

      // The string returned by toExponential either has the form \d\.\d+e[-+]\d+
      // (e.g., 1.2e+3) or the form \de[-+]\d+ (e.g., 1e+3).
      return [
        coefficient.length > 1 ? coefficient[0] + coefficient.slice(2) : coefficient,
        +x.slice(i + 1)
      ];
    }

    function exponent(x) {
      return x = formatDecimalParts(Math.abs(x)), x ? x[1] : NaN;
    }

    function formatGroup(grouping, thousands) {
      return function(value, width) {
        var i = value.length,
            t = [],
            j = 0,
            g = grouping[0],
            length = 0;

        while (i > 0 && g > 0) {
          if (length + g + 1 > width) g = Math.max(1, width - length);
          t.push(value.substring(i -= g, i + g));
          if ((length += g + 1) > width) break;
          g = grouping[j = (j + 1) % grouping.length];
        }

        return t.reverse().join(thousands);
      };
    }

    function formatNumerals(numerals) {
      return function(value) {
        return value.replace(/[0-9]/g, function(i) {
          return numerals[+i];
        });
      };
    }

    // [[fill]align][sign][symbol][0][width][,][.precision][~][type]
    var re = /^(?:(.)?([<>=^]))?([+\-( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?(~)?([a-z%])?$/i;

    function formatSpecifier(specifier) {
      if (!(match = re.exec(specifier))) throw new Error("invalid format: " + specifier);
      var match;
      return new FormatSpecifier({
        fill: match[1],
        align: match[2],
        sign: match[3],
        symbol: match[4],
        zero: match[5],
        width: match[6],
        comma: match[7],
        precision: match[8] && match[8].slice(1),
        trim: match[9],
        type: match[10]
      });
    }

    formatSpecifier.prototype = FormatSpecifier.prototype; // instanceof

    function FormatSpecifier(specifier) {
      this.fill = specifier.fill === undefined ? " " : specifier.fill + "";
      this.align = specifier.align === undefined ? ">" : specifier.align + "";
      this.sign = specifier.sign === undefined ? "-" : specifier.sign + "";
      this.symbol = specifier.symbol === undefined ? "" : specifier.symbol + "";
      this.zero = !!specifier.zero;
      this.width = specifier.width === undefined ? undefined : +specifier.width;
      this.comma = !!specifier.comma;
      this.precision = specifier.precision === undefined ? undefined : +specifier.precision;
      this.trim = !!specifier.trim;
      this.type = specifier.type === undefined ? "" : specifier.type + "";
    }

    FormatSpecifier.prototype.toString = function() {
      return this.fill
          + this.align
          + this.sign
          + this.symbol
          + (this.zero ? "0" : "")
          + (this.width === undefined ? "" : Math.max(1, this.width | 0))
          + (this.comma ? "," : "")
          + (this.precision === undefined ? "" : "." + Math.max(0, this.precision | 0))
          + (this.trim ? "~" : "")
          + this.type;
    };

    // Trims insignificant zeros, e.g., replaces 1.2000k with 1.2k.
    function formatTrim(s) {
      out: for (var n = s.length, i = 1, i0 = -1, i1; i < n; ++i) {
        switch (s[i]) {
          case ".": i0 = i1 = i; break;
          case "0": if (i0 === 0) i0 = i; i1 = i; break;
          default: if (!+s[i]) break out; if (i0 > 0) i0 = 0; break;
        }
      }
      return i0 > 0 ? s.slice(0, i0) + s.slice(i1 + 1) : s;
    }

    var prefixExponent;

    function formatPrefixAuto(x, p) {
      var d = formatDecimalParts(x, p);
      if (!d) return x + "";
      var coefficient = d[0],
          exponent = d[1],
          i = exponent - (prefixExponent = Math.max(-8, Math.min(8, Math.floor(exponent / 3))) * 3) + 1,
          n = coefficient.length;
      return i === n ? coefficient
          : i > n ? coefficient + new Array(i - n + 1).join("0")
          : i > 0 ? coefficient.slice(0, i) + "." + coefficient.slice(i)
          : "0." + new Array(1 - i).join("0") + formatDecimalParts(x, Math.max(0, p + i - 1))[0]; // less than 1y!
    }

    function formatRounded(x, p) {
      var d = formatDecimalParts(x, p);
      if (!d) return x + "";
      var coefficient = d[0],
          exponent = d[1];
      return exponent < 0 ? "0." + new Array(-exponent).join("0") + coefficient
          : coefficient.length > exponent + 1 ? coefficient.slice(0, exponent + 1) + "." + coefficient.slice(exponent + 1)
          : coefficient + new Array(exponent - coefficient.length + 2).join("0");
    }

    var formatTypes = {
      "%": function(x, p) { return (x * 100).toFixed(p); },
      "b": function(x) { return Math.round(x).toString(2); },
      "c": function(x) { return x + ""; },
      "d": formatDecimal,
      "e": function(x, p) { return x.toExponential(p); },
      "f": function(x, p) { return x.toFixed(p); },
      "g": function(x, p) { return x.toPrecision(p); },
      "o": function(x) { return Math.round(x).toString(8); },
      "p": function(x, p) { return formatRounded(x * 100, p); },
      "r": formatRounded,
      "s": formatPrefixAuto,
      "X": function(x) { return Math.round(x).toString(16).toUpperCase(); },
      "x": function(x) { return Math.round(x).toString(16); }
    };

    function identity$1(x) {
      return x;
    }

    var map = Array.prototype.map,
        prefixes = ["y","z","a","f","p","n","µ","m","","k","M","G","T","P","E","Z","Y"];

    function formatLocale(locale) {
      var group = locale.grouping === undefined || locale.thousands === undefined ? identity$1 : formatGroup(map.call(locale.grouping, Number), locale.thousands + ""),
          currencyPrefix = locale.currency === undefined ? "" : locale.currency[0] + "",
          currencySuffix = locale.currency === undefined ? "" : locale.currency[1] + "",
          decimal = locale.decimal === undefined ? "." : locale.decimal + "",
          numerals = locale.numerals === undefined ? identity$1 : formatNumerals(map.call(locale.numerals, String)),
          percent = locale.percent === undefined ? "%" : locale.percent + "",
          minus = locale.minus === undefined ? "-" : locale.minus + "",
          nan = locale.nan === undefined ? "NaN" : locale.nan + "";

      function newFormat(specifier) {
        specifier = formatSpecifier(specifier);

        var fill = specifier.fill,
            align = specifier.align,
            sign = specifier.sign,
            symbol = specifier.symbol,
            zero = specifier.zero,
            width = specifier.width,
            comma = specifier.comma,
            precision = specifier.precision,
            trim = specifier.trim,
            type = specifier.type;

        // The "n" type is an alias for ",g".
        if (type === "n") comma = true, type = "g";

        // The "" type, and any invalid type, is an alias for ".12~g".
        else if (!formatTypes[type]) precision === undefined && (precision = 12), trim = true, type = "g";

        // If zero fill is specified, padding goes after sign and before digits.
        if (zero || (fill === "0" && align === "=")) zero = true, fill = "0", align = "=";

        // Compute the prefix and suffix.
        // For SI-prefix, the suffix is lazily computed.
        var prefix = symbol === "$" ? currencyPrefix : symbol === "#" && /[boxX]/.test(type) ? "0" + type.toLowerCase() : "",
            suffix = symbol === "$" ? currencySuffix : /[%p]/.test(type) ? percent : "";

        // What format function should we use?
        // Is this an integer type?
        // Can this type generate exponential notation?
        var formatType = formatTypes[type],
            maybeSuffix = /[defgprs%]/.test(type);

        // Set the default precision if not specified,
        // or clamp the specified precision to the supported range.
        // For significant precision, it must be in [1, 21].
        // For fixed precision, it must be in [0, 20].
        precision = precision === undefined ? 6
            : /[gprs]/.test(type) ? Math.max(1, Math.min(21, precision))
            : Math.max(0, Math.min(20, precision));

        function format(value) {
          var valuePrefix = prefix,
              valueSuffix = suffix,
              i, n, c;

          if (type === "c") {
            valueSuffix = formatType(value) + valueSuffix;
            value = "";
          } else {
            value = +value;

            // Determine the sign. -0 is not less than 0, but 1 / -0 is!
            var valueNegative = value < 0 || 1 / value < 0;

            // Perform the initial formatting.
            value = isNaN(value) ? nan : formatType(Math.abs(value), precision);

            // Trim insignificant zeros.
            if (trim) value = formatTrim(value);

            // If a negative value rounds to zero after formatting, and no explicit positive sign is requested, hide the sign.
            if (valueNegative && +value === 0 && sign !== "+") valueNegative = false;

            // Compute the prefix and suffix.
            valuePrefix = (valueNegative ? (sign === "(" ? sign : minus) : sign === "-" || sign === "(" ? "" : sign) + valuePrefix;
            valueSuffix = (type === "s" ? prefixes[8 + prefixExponent / 3] : "") + valueSuffix + (valueNegative && sign === "(" ? ")" : "");

            // Break the formatted value into the integer “value” part that can be
            // grouped, and fractional or exponential “suffix” part that is not.
            if (maybeSuffix) {
              i = -1, n = value.length;
              while (++i < n) {
                if (c = value.charCodeAt(i), 48 > c || c > 57) {
                  valueSuffix = (c === 46 ? decimal + value.slice(i + 1) : value.slice(i)) + valueSuffix;
                  value = value.slice(0, i);
                  break;
                }
              }
            }
          }

          // If the fill character is not "0", grouping is applied before padding.
          if (comma && !zero) value = group(value, Infinity);

          // Compute the padding.
          var length = valuePrefix.length + value.length + valueSuffix.length,
              padding = length < width ? new Array(width - length + 1).join(fill) : "";

          // If the fill character is "0", grouping is applied after padding.
          if (comma && zero) value = group(padding + value, padding.length ? width - valueSuffix.length : Infinity), padding = "";

          // Reconstruct the final output based on the desired alignment.
          switch (align) {
            case "<": value = valuePrefix + value + valueSuffix + padding; break;
            case "=": value = valuePrefix + padding + value + valueSuffix; break;
            case "^": value = padding.slice(0, length = padding.length >> 1) + valuePrefix + value + valueSuffix + padding.slice(length); break;
            default: value = padding + valuePrefix + value + valueSuffix; break;
          }

          return numerals(value);
        }

        format.toString = function() {
          return specifier + "";
        };

        return format;
      }

      function formatPrefix(specifier, value) {
        var f = newFormat((specifier = formatSpecifier(specifier), specifier.type = "f", specifier)),
            e = Math.max(-8, Math.min(8, Math.floor(exponent(value) / 3))) * 3,
            k = Math.pow(10, -e),
            prefix = prefixes[8 + e / 3];
        return function(value) {
          return f(k * value) + prefix;
        };
      }

      return {
        format: newFormat,
        formatPrefix: formatPrefix
      };
    }

    var locale;
    var format;
    var formatPrefix;

    defaultLocale({
      decimal: ".",
      thousands: ",",
      grouping: [3],
      currency: ["$", ""],
      minus: "-"
    });

    function defaultLocale(definition) {
      locale = formatLocale(definition);
      format = locale.format;
      formatPrefix = locale.formatPrefix;
      return locale;
    }

    function precisionFixed(step) {
      return Math.max(0, -exponent(Math.abs(step)));
    }

    function precisionPrefix(step, value) {
      return Math.max(0, Math.max(-8, Math.min(8, Math.floor(exponent(value) / 3))) * 3 - exponent(Math.abs(step)));
    }

    function precisionRound(step, max) {
      step = Math.abs(step), max = Math.abs(max) - step;
      return Math.max(0, exponent(max) - exponent(step)) + 1;
    }

    function tickFormat(start, stop, count, specifier) {
      var step = tickStep(start, stop, count),
          precision;
      specifier = formatSpecifier(specifier == null ? ",f" : specifier);
      switch (specifier.type) {
        case "s": {
          var value = Math.max(Math.abs(start), Math.abs(stop));
          if (specifier.precision == null && !isNaN(precision = precisionPrefix(step, value))) specifier.precision = precision;
          return formatPrefix(specifier, value);
        }
        case "":
        case "e":
        case "g":
        case "p":
        case "r": {
          if (specifier.precision == null && !isNaN(precision = precisionRound(step, Math.max(Math.abs(start), Math.abs(stop))))) specifier.precision = precision - (specifier.type === "e");
          break;
        }
        case "f":
        case "%": {
          if (specifier.precision == null && !isNaN(precision = precisionFixed(step))) specifier.precision = precision - (specifier.type === "%") * 2;
          break;
        }
      }
      return format(specifier);
    }

    function linearish(scale) {
      var domain = scale.domain;

      scale.ticks = function(count) {
        var d = domain();
        return ticks(d[0], d[d.length - 1], count == null ? 10 : count);
      };

      scale.tickFormat = function(count, specifier) {
        var d = domain();
        return tickFormat(d[0], d[d.length - 1], count == null ? 10 : count, specifier);
      };

      scale.nice = function(count) {
        if (count == null) count = 10;

        var d = domain();
        var i0 = 0;
        var i1 = d.length - 1;
        var start = d[i0];
        var stop = d[i1];
        var prestep;
        var step;
        var maxIter = 10;

        if (stop < start) {
          step = start, start = stop, stop = step;
          step = i0, i0 = i1, i1 = step;
        }
        
        while (maxIter-- > 0) {
          step = tickIncrement(start, stop, count);
          if (step === prestep) {
            d[i0] = start;
            d[i1] = stop;
            return domain(d);
          } else if (step > 0) {
            start = Math.floor(start / step) * step;
            stop = Math.ceil(stop / step) * step;
          } else if (step < 0) {
            start = Math.ceil(start * step) / step;
            stop = Math.floor(stop * step) / step;
          } else {
            break;
          }
          prestep = step;
        }

        return scale;
      };

      return scale;
    }

    function linear$1() {
      var scale = continuous();

      scale.copy = function() {
        return copy(scale, linear$1());
      };

      initRange.apply(scale, arguments);

      return linearish(scale);
    }

    function transformPow(exponent) {
      return function(x) {
        return x < 0 ? -Math.pow(-x, exponent) : Math.pow(x, exponent);
      };
    }

    function transformSqrt(x) {
      return x < 0 ? -Math.sqrt(-x) : Math.sqrt(x);
    }

    function transformSquare(x) {
      return x < 0 ? -x * x : x * x;
    }

    function powish(transform) {
      var scale = transform(identity, identity),
          exponent = 1;

      function rescale() {
        return exponent === 1 ? transform(identity, identity)
            : exponent === 0.5 ? transform(transformSqrt, transformSquare)
            : transform(transformPow(exponent), transformPow(1 / exponent));
      }

      scale.exponent = function(_) {
        return arguments.length ? (exponent = +_, rescale()) : exponent;
      };

      return linearish(scale);
    }

    function pow() {
      var scale = powish(transformer());

      scale.copy = function() {
        return copy(scale, pow()).exponent(scale.exponent());
      };

      initRange.apply(scale, arguments);

      return scale;
    }

    function sqrt() {
      return pow.apply(null, arguments).exponent(0.5);
    }

    var t0 = new Date,
        t1 = new Date;

    function newInterval(floori, offseti, count, field) {

      function interval(date) {
        return floori(date = arguments.length === 0 ? new Date : new Date(+date)), date;
      }

      interval.floor = function(date) {
        return floori(date = new Date(+date)), date;
      };

      interval.ceil = function(date) {
        return floori(date = new Date(date - 1)), offseti(date, 1), floori(date), date;
      };

      interval.round = function(date) {
        var d0 = interval(date),
            d1 = interval.ceil(date);
        return date - d0 < d1 - date ? d0 : d1;
      };

      interval.offset = function(date, step) {
        return offseti(date = new Date(+date), step == null ? 1 : Math.floor(step)), date;
      };

      interval.range = function(start, stop, step) {
        var range = [], previous;
        start = interval.ceil(start);
        step = step == null ? 1 : Math.floor(step);
        if (!(start < stop) || !(step > 0)) return range; // also handles Invalid Date
        do range.push(previous = new Date(+start)), offseti(start, step), floori(start);
        while (previous < start && start < stop);
        return range;
      };

      interval.filter = function(test) {
        return newInterval(function(date) {
          if (date >= date) while (floori(date), !test(date)) date.setTime(date - 1);
        }, function(date, step) {
          if (date >= date) {
            if (step < 0) while (++step <= 0) {
              while (offseti(date, -1), !test(date)) {} // eslint-disable-line no-empty
            } else while (--step >= 0) {
              while (offseti(date, +1), !test(date)) {} // eslint-disable-line no-empty
            }
          }
        });
      };

      if (count) {
        interval.count = function(start, end) {
          t0.setTime(+start), t1.setTime(+end);
          floori(t0), floori(t1);
          return Math.floor(count(t0, t1));
        };

        interval.every = function(step) {
          step = Math.floor(step);
          return !isFinite(step) || !(step > 0) ? null
              : !(step > 1) ? interval
              : interval.filter(field
                  ? function(d) { return field(d) % step === 0; }
                  : function(d) { return interval.count(0, d) % step === 0; });
        };
      }

      return interval;
    }

    var durationMinute = 6e4;
    var durationDay = 864e5;
    var durationWeek = 6048e5;

    var day = newInterval(function(date) {
      date.setHours(0, 0, 0, 0);
    }, function(date, step) {
      date.setDate(date.getDate() + step);
    }, function(start, end) {
      return (end - start - (end.getTimezoneOffset() - start.getTimezoneOffset()) * durationMinute) / durationDay;
    }, function(date) {
      return date.getDate() - 1;
    });

    function weekday(i) {
      return newInterval(function(date) {
        date.setDate(date.getDate() - (date.getDay() + 7 - i) % 7);
        date.setHours(0, 0, 0, 0);
      }, function(date, step) {
        date.setDate(date.getDate() + step * 7);
      }, function(start, end) {
        return (end - start - (end.getTimezoneOffset() - start.getTimezoneOffset()) * durationMinute) / durationWeek;
      });
    }

    var sunday = weekday(0);
    var monday = weekday(1);
    weekday(2);
    weekday(3);
    var thursday = weekday(4);
    weekday(5);
    weekday(6);

    var year = newInterval(function(date) {
      date.setMonth(0, 1);
      date.setHours(0, 0, 0, 0);
    }, function(date, step) {
      date.setFullYear(date.getFullYear() + step);
    }, function(start, end) {
      return end.getFullYear() - start.getFullYear();
    }, function(date) {
      return date.getFullYear();
    });

    // An optimized implementation for this simple case.
    year.every = function(k) {
      return !isFinite(k = Math.floor(k)) || !(k > 0) ? null : newInterval(function(date) {
        date.setFullYear(Math.floor(date.getFullYear() / k) * k);
        date.setMonth(0, 1);
        date.setHours(0, 0, 0, 0);
      }, function(date, step) {
        date.setFullYear(date.getFullYear() + step * k);
      });
    };

    var utcDay = newInterval(function(date) {
      date.setUTCHours(0, 0, 0, 0);
    }, function(date, step) {
      date.setUTCDate(date.getUTCDate() + step);
    }, function(start, end) {
      return (end - start) / durationDay;
    }, function(date) {
      return date.getUTCDate() - 1;
    });

    function utcWeekday(i) {
      return newInterval(function(date) {
        date.setUTCDate(date.getUTCDate() - (date.getUTCDay() + 7 - i) % 7);
        date.setUTCHours(0, 0, 0, 0);
      }, function(date, step) {
        date.setUTCDate(date.getUTCDate() + step * 7);
      }, function(start, end) {
        return (end - start) / durationWeek;
      });
    }

    var utcSunday = utcWeekday(0);
    var utcMonday = utcWeekday(1);
    utcWeekday(2);
    utcWeekday(3);
    var utcThursday = utcWeekday(4);
    utcWeekday(5);
    utcWeekday(6);

    var utcYear = newInterval(function(date) {
      date.setUTCMonth(0, 1);
      date.setUTCHours(0, 0, 0, 0);
    }, function(date, step) {
      date.setUTCFullYear(date.getUTCFullYear() + step);
    }, function(start, end) {
      return end.getUTCFullYear() - start.getUTCFullYear();
    }, function(date) {
      return date.getUTCFullYear();
    });

    // An optimized implementation for this simple case.
    utcYear.every = function(k) {
      return !isFinite(k = Math.floor(k)) || !(k > 0) ? null : newInterval(function(date) {
        date.setUTCFullYear(Math.floor(date.getUTCFullYear() / k) * k);
        date.setUTCMonth(0, 1);
        date.setUTCHours(0, 0, 0, 0);
      }, function(date, step) {
        date.setUTCFullYear(date.getUTCFullYear() + step * k);
      });
    };

    function localDate(d) {
      if (0 <= d.y && d.y < 100) {
        var date = new Date(-1, d.m, d.d, d.H, d.M, d.S, d.L);
        date.setFullYear(d.y);
        return date;
      }
      return new Date(d.y, d.m, d.d, d.H, d.M, d.S, d.L);
    }

    function utcDate(d) {
      if (0 <= d.y && d.y < 100) {
        var date = new Date(Date.UTC(-1, d.m, d.d, d.H, d.M, d.S, d.L));
        date.setUTCFullYear(d.y);
        return date;
      }
      return new Date(Date.UTC(d.y, d.m, d.d, d.H, d.M, d.S, d.L));
    }

    function newDate(y, m, d) {
      return {y: y, m: m, d: d, H: 0, M: 0, S: 0, L: 0};
    }

    function formatLocale$1(locale) {
      var locale_dateTime = locale.dateTime,
          locale_date = locale.date,
          locale_time = locale.time,
          locale_periods = locale.periods,
          locale_weekdays = locale.days,
          locale_shortWeekdays = locale.shortDays,
          locale_months = locale.months,
          locale_shortMonths = locale.shortMonths;

      var periodRe = formatRe(locale_periods),
          periodLookup = formatLookup(locale_periods),
          weekdayRe = formatRe(locale_weekdays),
          weekdayLookup = formatLookup(locale_weekdays),
          shortWeekdayRe = formatRe(locale_shortWeekdays),
          shortWeekdayLookup = formatLookup(locale_shortWeekdays),
          monthRe = formatRe(locale_months),
          monthLookup = formatLookup(locale_months),
          shortMonthRe = formatRe(locale_shortMonths),
          shortMonthLookup = formatLookup(locale_shortMonths);

      var formats = {
        "a": formatShortWeekday,
        "A": formatWeekday,
        "b": formatShortMonth,
        "B": formatMonth,
        "c": null,
        "d": formatDayOfMonth,
        "e": formatDayOfMonth,
        "f": formatMicroseconds,
        "g": formatYearISO,
        "G": formatFullYearISO,
        "H": formatHour24,
        "I": formatHour12,
        "j": formatDayOfYear,
        "L": formatMilliseconds,
        "m": formatMonthNumber,
        "M": formatMinutes,
        "p": formatPeriod,
        "q": formatQuarter,
        "Q": formatUnixTimestamp,
        "s": formatUnixTimestampSeconds,
        "S": formatSeconds,
        "u": formatWeekdayNumberMonday,
        "U": formatWeekNumberSunday,
        "V": formatWeekNumberISO,
        "w": formatWeekdayNumberSunday,
        "W": formatWeekNumberMonday,
        "x": null,
        "X": null,
        "y": formatYear,
        "Y": formatFullYear,
        "Z": formatZone,
        "%": formatLiteralPercent
      };

      var utcFormats = {
        "a": formatUTCShortWeekday,
        "A": formatUTCWeekday,
        "b": formatUTCShortMonth,
        "B": formatUTCMonth,
        "c": null,
        "d": formatUTCDayOfMonth,
        "e": formatUTCDayOfMonth,
        "f": formatUTCMicroseconds,
        "g": formatUTCYearISO,
        "G": formatUTCFullYearISO,
        "H": formatUTCHour24,
        "I": formatUTCHour12,
        "j": formatUTCDayOfYear,
        "L": formatUTCMilliseconds,
        "m": formatUTCMonthNumber,
        "M": formatUTCMinutes,
        "p": formatUTCPeriod,
        "q": formatUTCQuarter,
        "Q": formatUnixTimestamp,
        "s": formatUnixTimestampSeconds,
        "S": formatUTCSeconds,
        "u": formatUTCWeekdayNumberMonday,
        "U": formatUTCWeekNumberSunday,
        "V": formatUTCWeekNumberISO,
        "w": formatUTCWeekdayNumberSunday,
        "W": formatUTCWeekNumberMonday,
        "x": null,
        "X": null,
        "y": formatUTCYear,
        "Y": formatUTCFullYear,
        "Z": formatUTCZone,
        "%": formatLiteralPercent
      };

      var parses = {
        "a": parseShortWeekday,
        "A": parseWeekday,
        "b": parseShortMonth,
        "B": parseMonth,
        "c": parseLocaleDateTime,
        "d": parseDayOfMonth,
        "e": parseDayOfMonth,
        "f": parseMicroseconds,
        "g": parseYear,
        "G": parseFullYear,
        "H": parseHour24,
        "I": parseHour24,
        "j": parseDayOfYear,
        "L": parseMilliseconds,
        "m": parseMonthNumber,
        "M": parseMinutes,
        "p": parsePeriod,
        "q": parseQuarter,
        "Q": parseUnixTimestamp,
        "s": parseUnixTimestampSeconds,
        "S": parseSeconds,
        "u": parseWeekdayNumberMonday,
        "U": parseWeekNumberSunday,
        "V": parseWeekNumberISO,
        "w": parseWeekdayNumberSunday,
        "W": parseWeekNumberMonday,
        "x": parseLocaleDate,
        "X": parseLocaleTime,
        "y": parseYear,
        "Y": parseFullYear,
        "Z": parseZone,
        "%": parseLiteralPercent
      };

      // These recursive directive definitions must be deferred.
      formats.x = newFormat(locale_date, formats);
      formats.X = newFormat(locale_time, formats);
      formats.c = newFormat(locale_dateTime, formats);
      utcFormats.x = newFormat(locale_date, utcFormats);
      utcFormats.X = newFormat(locale_time, utcFormats);
      utcFormats.c = newFormat(locale_dateTime, utcFormats);

      function newFormat(specifier, formats) {
        return function(date) {
          var string = [],
              i = -1,
              j = 0,
              n = specifier.length,
              c,
              pad,
              format;

          if (!(date instanceof Date)) date = new Date(+date);

          while (++i < n) {
            if (specifier.charCodeAt(i) === 37) {
              string.push(specifier.slice(j, i));
              if ((pad = pads[c = specifier.charAt(++i)]) != null) c = specifier.charAt(++i);
              else pad = c === "e" ? " " : "0";
              if (format = formats[c]) c = format(date, pad);
              string.push(c);
              j = i + 1;
            }
          }

          string.push(specifier.slice(j, i));
          return string.join("");
        };
      }

      function newParse(specifier, Z) {
        return function(string) {
          var d = newDate(1900, undefined, 1),
              i = parseSpecifier(d, specifier, string += "", 0),
              week, day$1;
          if (i != string.length) return null;

          // If a UNIX timestamp is specified, return it.
          if ("Q" in d) return new Date(d.Q);
          if ("s" in d) return new Date(d.s * 1000 + ("L" in d ? d.L : 0));

          // If this is utcParse, never use the local timezone.
          if (Z && !("Z" in d)) d.Z = 0;

          // The am-pm flag is 0 for AM, and 1 for PM.
          if ("p" in d) d.H = d.H % 12 + d.p * 12;

          // If the month was not specified, inherit from the quarter.
          if (d.m === undefined) d.m = "q" in d ? d.q : 0;

          // Convert day-of-week and week-of-year to day-of-year.
          if ("V" in d) {
            if (d.V < 1 || d.V > 53) return null;
            if (!("w" in d)) d.w = 1;
            if ("Z" in d) {
              week = utcDate(newDate(d.y, 0, 1)), day$1 = week.getUTCDay();
              week = day$1 > 4 || day$1 === 0 ? utcMonday.ceil(week) : utcMonday(week);
              week = utcDay.offset(week, (d.V - 1) * 7);
              d.y = week.getUTCFullYear();
              d.m = week.getUTCMonth();
              d.d = week.getUTCDate() + (d.w + 6) % 7;
            } else {
              week = localDate(newDate(d.y, 0, 1)), day$1 = week.getDay();
              week = day$1 > 4 || day$1 === 0 ? monday.ceil(week) : monday(week);
              week = day.offset(week, (d.V - 1) * 7);
              d.y = week.getFullYear();
              d.m = week.getMonth();
              d.d = week.getDate() + (d.w + 6) % 7;
            }
          } else if ("W" in d || "U" in d) {
            if (!("w" in d)) d.w = "u" in d ? d.u % 7 : "W" in d ? 1 : 0;
            day$1 = "Z" in d ? utcDate(newDate(d.y, 0, 1)).getUTCDay() : localDate(newDate(d.y, 0, 1)).getDay();
            d.m = 0;
            d.d = "W" in d ? (d.w + 6) % 7 + d.W * 7 - (day$1 + 5) % 7 : d.w + d.U * 7 - (day$1 + 6) % 7;
          }

          // If a time zone is specified, all fields are interpreted as UTC and then
          // offset according to the specified time zone.
          if ("Z" in d) {
            d.H += d.Z / 100 | 0;
            d.M += d.Z % 100;
            return utcDate(d);
          }

          // Otherwise, all fields are in local time.
          return localDate(d);
        };
      }

      function parseSpecifier(d, specifier, string, j) {
        var i = 0,
            n = specifier.length,
            m = string.length,
            c,
            parse;

        while (i < n) {
          if (j >= m) return -1;
          c = specifier.charCodeAt(i++);
          if (c === 37) {
            c = specifier.charAt(i++);
            parse = parses[c in pads ? specifier.charAt(i++) : c];
            if (!parse || ((j = parse(d, string, j)) < 0)) return -1;
          } else if (c != string.charCodeAt(j++)) {
            return -1;
          }
        }

        return j;
      }

      function parsePeriod(d, string, i) {
        var n = periodRe.exec(string.slice(i));
        return n ? (d.p = periodLookup[n[0].toLowerCase()], i + n[0].length) : -1;
      }

      function parseShortWeekday(d, string, i) {
        var n = shortWeekdayRe.exec(string.slice(i));
        return n ? (d.w = shortWeekdayLookup[n[0].toLowerCase()], i + n[0].length) : -1;
      }

      function parseWeekday(d, string, i) {
        var n = weekdayRe.exec(string.slice(i));
        return n ? (d.w = weekdayLookup[n[0].toLowerCase()], i + n[0].length) : -1;
      }

      function parseShortMonth(d, string, i) {
        var n = shortMonthRe.exec(string.slice(i));
        return n ? (d.m = shortMonthLookup[n[0].toLowerCase()], i + n[0].length) : -1;
      }

      function parseMonth(d, string, i) {
        var n = monthRe.exec(string.slice(i));
        return n ? (d.m = monthLookup[n[0].toLowerCase()], i + n[0].length) : -1;
      }

      function parseLocaleDateTime(d, string, i) {
        return parseSpecifier(d, locale_dateTime, string, i);
      }

      function parseLocaleDate(d, string, i) {
        return parseSpecifier(d, locale_date, string, i);
      }

      function parseLocaleTime(d, string, i) {
        return parseSpecifier(d, locale_time, string, i);
      }

      function formatShortWeekday(d) {
        return locale_shortWeekdays[d.getDay()];
      }

      function formatWeekday(d) {
        return locale_weekdays[d.getDay()];
      }

      function formatShortMonth(d) {
        return locale_shortMonths[d.getMonth()];
      }

      function formatMonth(d) {
        return locale_months[d.getMonth()];
      }

      function formatPeriod(d) {
        return locale_periods[+(d.getHours() >= 12)];
      }

      function formatQuarter(d) {
        return 1 + ~~(d.getMonth() / 3);
      }

      function formatUTCShortWeekday(d) {
        return locale_shortWeekdays[d.getUTCDay()];
      }

      function formatUTCWeekday(d) {
        return locale_weekdays[d.getUTCDay()];
      }

      function formatUTCShortMonth(d) {
        return locale_shortMonths[d.getUTCMonth()];
      }

      function formatUTCMonth(d) {
        return locale_months[d.getUTCMonth()];
      }

      function formatUTCPeriod(d) {
        return locale_periods[+(d.getUTCHours() >= 12)];
      }

      function formatUTCQuarter(d) {
        return 1 + ~~(d.getUTCMonth() / 3);
      }

      return {
        format: function(specifier) {
          var f = newFormat(specifier += "", formats);
          f.toString = function() { return specifier; };
          return f;
        },
        parse: function(specifier) {
          var p = newParse(specifier += "", false);
          p.toString = function() { return specifier; };
          return p;
        },
        utcFormat: function(specifier) {
          var f = newFormat(specifier += "", utcFormats);
          f.toString = function() { return specifier; };
          return f;
        },
        utcParse: function(specifier) {
          var p = newParse(specifier += "", true);
          p.toString = function() { return specifier; };
          return p;
        }
      };
    }

    var pads = {"-": "", "_": " ", "0": "0"},
        numberRe = /^\s*\d+/, // note: ignores next directive
        percentRe = /^%/,
        requoteRe = /[\\^$*+?|[\]().{}]/g;

    function pad(value, fill, width) {
      var sign = value < 0 ? "-" : "",
          string = (sign ? -value : value) + "",
          length = string.length;
      return sign + (length < width ? new Array(width - length + 1).join(fill) + string : string);
    }

    function requote(s) {
      return s.replace(requoteRe, "\\$&");
    }

    function formatRe(names) {
      return new RegExp("^(?:" + names.map(requote).join("|") + ")", "i");
    }

    function formatLookup(names) {
      var map = {}, i = -1, n = names.length;
      while (++i < n) map[names[i].toLowerCase()] = i;
      return map;
    }

    function parseWeekdayNumberSunday(d, string, i) {
      var n = numberRe.exec(string.slice(i, i + 1));
      return n ? (d.w = +n[0], i + n[0].length) : -1;
    }

    function parseWeekdayNumberMonday(d, string, i) {
      var n = numberRe.exec(string.slice(i, i + 1));
      return n ? (d.u = +n[0], i + n[0].length) : -1;
    }

    function parseWeekNumberSunday(d, string, i) {
      var n = numberRe.exec(string.slice(i, i + 2));
      return n ? (d.U = +n[0], i + n[0].length) : -1;
    }

    function parseWeekNumberISO(d, string, i) {
      var n = numberRe.exec(string.slice(i, i + 2));
      return n ? (d.V = +n[0], i + n[0].length) : -1;
    }

    function parseWeekNumberMonday(d, string, i) {
      var n = numberRe.exec(string.slice(i, i + 2));
      return n ? (d.W = +n[0], i + n[0].length) : -1;
    }

    function parseFullYear(d, string, i) {
      var n = numberRe.exec(string.slice(i, i + 4));
      return n ? (d.y = +n[0], i + n[0].length) : -1;
    }

    function parseYear(d, string, i) {
      var n = numberRe.exec(string.slice(i, i + 2));
      return n ? (d.y = +n[0] + (+n[0] > 68 ? 1900 : 2000), i + n[0].length) : -1;
    }

    function parseZone(d, string, i) {
      var n = /^(Z)|([+-]\d\d)(?::?(\d\d))?/.exec(string.slice(i, i + 6));
      return n ? (d.Z = n[1] ? 0 : -(n[2] + (n[3] || "00")), i + n[0].length) : -1;
    }

    function parseQuarter(d, string, i) {
      var n = numberRe.exec(string.slice(i, i + 1));
      return n ? (d.q = n[0] * 3 - 3, i + n[0].length) : -1;
    }

    function parseMonthNumber(d, string, i) {
      var n = numberRe.exec(string.slice(i, i + 2));
      return n ? (d.m = n[0] - 1, i + n[0].length) : -1;
    }

    function parseDayOfMonth(d, string, i) {
      var n = numberRe.exec(string.slice(i, i + 2));
      return n ? (d.d = +n[0], i + n[0].length) : -1;
    }

    function parseDayOfYear(d, string, i) {
      var n = numberRe.exec(string.slice(i, i + 3));
      return n ? (d.m = 0, d.d = +n[0], i + n[0].length) : -1;
    }

    function parseHour24(d, string, i) {
      var n = numberRe.exec(string.slice(i, i + 2));
      return n ? (d.H = +n[0], i + n[0].length) : -1;
    }

    function parseMinutes(d, string, i) {
      var n = numberRe.exec(string.slice(i, i + 2));
      return n ? (d.M = +n[0], i + n[0].length) : -1;
    }

    function parseSeconds(d, string, i) {
      var n = numberRe.exec(string.slice(i, i + 2));
      return n ? (d.S = +n[0], i + n[0].length) : -1;
    }

    function parseMilliseconds(d, string, i) {
      var n = numberRe.exec(string.slice(i, i + 3));
      return n ? (d.L = +n[0], i + n[0].length) : -1;
    }

    function parseMicroseconds(d, string, i) {
      var n = numberRe.exec(string.slice(i, i + 6));
      return n ? (d.L = Math.floor(n[0] / 1000), i + n[0].length) : -1;
    }

    function parseLiteralPercent(d, string, i) {
      var n = percentRe.exec(string.slice(i, i + 1));
      return n ? i + n[0].length : -1;
    }

    function parseUnixTimestamp(d, string, i) {
      var n = numberRe.exec(string.slice(i));
      return n ? (d.Q = +n[0], i + n[0].length) : -1;
    }

    function parseUnixTimestampSeconds(d, string, i) {
      var n = numberRe.exec(string.slice(i));
      return n ? (d.s = +n[0], i + n[0].length) : -1;
    }

    function formatDayOfMonth(d, p) {
      return pad(d.getDate(), p, 2);
    }

    function formatHour24(d, p) {
      return pad(d.getHours(), p, 2);
    }

    function formatHour12(d, p) {
      return pad(d.getHours() % 12 || 12, p, 2);
    }

    function formatDayOfYear(d, p) {
      return pad(1 + day.count(year(d), d), p, 3);
    }

    function formatMilliseconds(d, p) {
      return pad(d.getMilliseconds(), p, 3);
    }

    function formatMicroseconds(d, p) {
      return formatMilliseconds(d, p) + "000";
    }

    function formatMonthNumber(d, p) {
      return pad(d.getMonth() + 1, p, 2);
    }

    function formatMinutes(d, p) {
      return pad(d.getMinutes(), p, 2);
    }

    function formatSeconds(d, p) {
      return pad(d.getSeconds(), p, 2);
    }

    function formatWeekdayNumberMonday(d) {
      var day = d.getDay();
      return day === 0 ? 7 : day;
    }

    function formatWeekNumberSunday(d, p) {
      return pad(sunday.count(year(d) - 1, d), p, 2);
    }

    function dISO(d) {
      var day = d.getDay();
      return (day >= 4 || day === 0) ? thursday(d) : thursday.ceil(d);
    }

    function formatWeekNumberISO(d, p) {
      d = dISO(d);
      return pad(thursday.count(year(d), d) + (year(d).getDay() === 4), p, 2);
    }

    function formatWeekdayNumberSunday(d) {
      return d.getDay();
    }

    function formatWeekNumberMonday(d, p) {
      return pad(monday.count(year(d) - 1, d), p, 2);
    }

    function formatYear(d, p) {
      return pad(d.getFullYear() % 100, p, 2);
    }

    function formatYearISO(d, p) {
      d = dISO(d);
      return pad(d.getFullYear() % 100, p, 2);
    }

    function formatFullYear(d, p) {
      return pad(d.getFullYear() % 10000, p, 4);
    }

    function formatFullYearISO(d, p) {
      var day = d.getDay();
      d = (day >= 4 || day === 0) ? thursday(d) : thursday.ceil(d);
      return pad(d.getFullYear() % 10000, p, 4);
    }

    function formatZone(d) {
      var z = d.getTimezoneOffset();
      return (z > 0 ? "-" : (z *= -1, "+"))
          + pad(z / 60 | 0, "0", 2)
          + pad(z % 60, "0", 2);
    }

    function formatUTCDayOfMonth(d, p) {
      return pad(d.getUTCDate(), p, 2);
    }

    function formatUTCHour24(d, p) {
      return pad(d.getUTCHours(), p, 2);
    }

    function formatUTCHour12(d, p) {
      return pad(d.getUTCHours() % 12 || 12, p, 2);
    }

    function formatUTCDayOfYear(d, p) {
      return pad(1 + utcDay.count(utcYear(d), d), p, 3);
    }

    function formatUTCMilliseconds(d, p) {
      return pad(d.getUTCMilliseconds(), p, 3);
    }

    function formatUTCMicroseconds(d, p) {
      return formatUTCMilliseconds(d, p) + "000";
    }

    function formatUTCMonthNumber(d, p) {
      return pad(d.getUTCMonth() + 1, p, 2);
    }

    function formatUTCMinutes(d, p) {
      return pad(d.getUTCMinutes(), p, 2);
    }

    function formatUTCSeconds(d, p) {
      return pad(d.getUTCSeconds(), p, 2);
    }

    function formatUTCWeekdayNumberMonday(d) {
      var dow = d.getUTCDay();
      return dow === 0 ? 7 : dow;
    }

    function formatUTCWeekNumberSunday(d, p) {
      return pad(utcSunday.count(utcYear(d) - 1, d), p, 2);
    }

    function UTCdISO(d) {
      var day = d.getUTCDay();
      return (day >= 4 || day === 0) ? utcThursday(d) : utcThursday.ceil(d);
    }

    function formatUTCWeekNumberISO(d, p) {
      d = UTCdISO(d);
      return pad(utcThursday.count(utcYear(d), d) + (utcYear(d).getUTCDay() === 4), p, 2);
    }

    function formatUTCWeekdayNumberSunday(d) {
      return d.getUTCDay();
    }

    function formatUTCWeekNumberMonday(d, p) {
      return pad(utcMonday.count(utcYear(d) - 1, d), p, 2);
    }

    function formatUTCYear(d, p) {
      return pad(d.getUTCFullYear() % 100, p, 2);
    }

    function formatUTCYearISO(d, p) {
      d = UTCdISO(d);
      return pad(d.getUTCFullYear() % 100, p, 2);
    }

    function formatUTCFullYear(d, p) {
      return pad(d.getUTCFullYear() % 10000, p, 4);
    }

    function formatUTCFullYearISO(d, p) {
      var day = d.getUTCDay();
      d = (day >= 4 || day === 0) ? utcThursday(d) : utcThursday.ceil(d);
      return pad(d.getUTCFullYear() % 10000, p, 4);
    }

    function formatUTCZone() {
      return "+0000";
    }

    function formatLiteralPercent() {
      return "%";
    }

    function formatUnixTimestamp(d) {
      return +d;
    }

    function formatUnixTimestampSeconds(d) {
      return Math.floor(+d / 1000);
    }

    var locale$1;
    var timeFormat;
    var timeParse;

    defaultLocale$1({
      dateTime: "%x, %X",
      date: "%-m/%-d/%Y",
      time: "%-I:%M:%S %p",
      periods: ["AM", "PM"],
      days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      shortDays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
      shortMonths: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    });

    function defaultLocale$1(definition) {
      locale$1 = formatLocale$1(definition);
      timeFormat = locale$1.format;
      timeParse = locale$1.parse;
      locale$1.utcFormat;
      locale$1.utcParse;
      return locale$1;
    }

    var defaultScales = {
    	x: linear$1,
    	y: linear$1,
    	z: linear$1,
    	r: sqrt
    };

    /* --------------------------------------------
     *
     * Determine whether a scale is a log, symlog, power or other
     * This is not meant to be exhaustive of all the different types of
     * scales in d3-scale and focuses on continuous scales
     *
     * --------------------------------------------
     */
    function findScaleType(scale) {
    	if (scale.constant) {
    		return 'symlog';
    	}
    	if (scale.base) {
    		return 'log';
    	}
    	if (scale.exponent) {
    		if (scale.exponent() === 0.5) {
    			return 'sqrt';
    		}
    		return 'pow';
    	}
    	return 'other';
    }

    function identity$2 (d) {
    	return d;
    }

    function log(sign) {
    	return x => Math.log(sign * x);
    }

    function exp(sign) {
    	return x => sign * Math.exp(x);
    }

    function symlog(c) {
    	return x => Math.sign(x) * Math.log1p(Math.abs(x / c));
    }

    function symexp(c) {
    	return x => Math.sign(x) * Math.expm1(Math.abs(x)) * c;
    }

    function pow$1(exponent) {
    	return function powFn(x) {
    		return x < 0 ? -Math.pow(-x, exponent) : Math.pow(x, exponent);
    	};
    }

    function getPadFunctions(scale) {
    	const scaleType = findScaleType(scale);

    	if (scaleType === 'log') {
    		const sign = Math.sign(scale.domain()[0]);
    		return { lift: log(sign), ground: exp(sign), scaleType };
    	}
    	if (scaleType === 'pow') {
    		const exponent = 1;
    		return { lift: pow$1(exponent), ground: pow$1(1 / exponent), scaleType };
    	}
    	if (scaleType === 'sqrt') {
    		const exponent = 0.5;
    		return { lift: pow$1(exponent), ground: pow$1(1 / exponent), scaleType };
    	}
    	if (scaleType === 'symlog') {
    		const constant = 1;
    		return { lift: symlog(constant), ground: symexp(constant), scaleType };
    	}

    	return { lift: identity$2, ground: identity$2, scaleType };
    }

    /* --------------------------------------------
     *
     * Returns a modified scale domain by in/decreasing
     * the min/max by taking the desired difference
     * in pixels and converting it to units of data.
     * Returns an array that you can set as the new domain.
     * Padding contributed by @veltman.
     * See here for discussion of transforms: https://github.com/d3/d3-scale/issues/150
     *
     * --------------------------------------------
     */

    function padScale (scale, padding) {
    	if (typeof scale.range !== 'function') {
    		throw new Error('Scale method `range` must be a function');
    	}
    	if (typeof scale.domain !== 'function') {
    		throw new Error('Scale method `domain` must be a function');
    	}
    	if (!Array.isArray(padding)) {
    		return scale.domain();
    	}

    	if (scale.domain().length !== 2) {
    		console.warn('[LayerCake] The scale is expected to have a domain of length 2 to use padding. Are you sure you want to use padding? Your scale\'s domain is:', scale.domain());
    	}
    	if (scale.range().length !== 2) {
    		console.warn('[LayerCake] The scale is expected to have a range of length 2 to use padding. Are you sure you want to use padding? Your scale\'s range is:', scale.range());
    	}

    	const { lift, ground } = getPadFunctions(scale);

    	const d0 = scale.domain()[0];

    	const isTime = Object.prototype.toString.call(d0) === '[object Date]';

    	const [d1, d2] = scale.domain().map(d => {
    		return isTime ? lift(d.getTime()) : lift(d);
    	});
    	const [r1, r2] = scale.range();
    	const paddingLeft = padding[0] || 0;
    	const paddingRight = padding[1] || 0;

    	const step = (d2 - d1) / (Math.abs(r2 - r1) - paddingLeft - paddingRight); // Math.abs() to properly handle reversed scales

    	return [d1 - paddingLeft * step, paddingRight * step + d2].map(d => {
    		return isTime ? ground(new Date(d)) : ground(d);
    	});
    }

    /* eslint-disable no-nested-ternary */
    function calcBaseRange(s, width, height, reverse, percentRange) {
    	let min;
    	let max;
    	if (percentRange === true) {
    		min = 0;
    		max = 100;
    	} else {
    		min = s === 'r' ? 1 : 0;
    		max = s === 'y' ? height : s === 'r' ? 25 : width;
    	}
    	return reverse === true ? [max, min] : [min, max];
    }

    function getDefaultRange(s, width, height, reverse, range, percentRange) {
    	return !range
    		? calcBaseRange(s, width, height, reverse, percentRange)
    		: typeof range === 'function'
    			? range({ width, height })
    			: range;
    }

    function createScale (s) {
    	return function scaleCreator ([$scale, $extents, $domain, $padding, $nice, $reverse, $width, $height, $range, $percentScale]) {
    		if ($extents === null) {
    			return null;
    		}

    		const defaultRange = getDefaultRange(s, $width, $height, $reverse, $range, $percentScale);

    		const scale = $scale === defaultScales[s] ? $scale() : $scale.copy();

    		/* --------------------------------------------
    		 * On creation, `$domain` will already have any nulls filled in
    		 * But if we set it via the context it might not, so rerun it through partialDomain
    		 */
    		scale
    			.domain(partialDomain($extents[s], $domain))
    			.range(defaultRange);

    		if ($padding) {
    			scale.domain(padScale(scale, $padding));
    		}

    		if ($nice === true) {
    			if (typeof scale.nice === 'function') {
    				scale.nice();
    			} else {
    				console.error(`[Layer Cake] You set \`${s}Nice: true\` but the ${s}Scale does not have a \`.nice\` method. Ignoring...`);
    			}
    		}

    		return scale;
    	};
    }

    function createGetter ([$acc, $scale]) {
    	return d => {
    		const val = $acc(d);
    		if (Array.isArray(val)) {
    			return val.map(v => $scale(v));
    		}
    		return $scale(val);
    	};
    }

    function getRange([$scale]) {
    	if (typeof $scale === 'function') {
    		if (typeof $scale.range === 'function') {
    			return $scale.range();
    		}
    		console.error('[LayerCake] Your scale doesn\'t have a `.range` method?');
    	}
    	return null;
    }

    var defaultReverses = {
    	x: false,
    	y: true,
    	z: false,
    	r: false
    };

    /* node_modules/layercake/src/LayerCake.svelte generated by Svelte v3.32.2 */

    const { Object: Object_1, console: console_1 } = globals;
    const file = "node_modules/layercake/src/LayerCake.svelte";

    const get_default_slot_changes = dirty => ({
    	element: dirty[0] & /*element*/ 4,
    	width: dirty[0] & /*$width_d*/ 64,
    	height: dirty[0] & /*$height_d*/ 128,
    	aspectRatio: dirty[0] & /*$aspectRatio_d*/ 256,
    	containerWidth: dirty[0] & /*$_containerWidth*/ 512,
    	containerHeight: dirty[0] & /*$_containerHeight*/ 1024
    });

    const get_default_slot_context = ctx => ({
    	element: /*element*/ ctx[2],
    	width: /*$width_d*/ ctx[6],
    	height: /*$height_d*/ ctx[7],
    	aspectRatio: /*$aspectRatio_d*/ ctx[8],
    	containerWidth: /*$_containerWidth*/ ctx[9],
    	containerHeight: /*$_containerHeight*/ ctx[10]
    });

    // (308:0) {#if (ssr === true || typeof window !== 'undefined')}
    function create_if_block(ctx) {
    	let div;
    	let div_style_value;
    	let div_resize_listener;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[54].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[53], get_default_slot_context);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "layercake-container svelte-vhzpsp");

    			attr_dev(div, "style", div_style_value = "\n\t\t\tposition:" + /*position*/ ctx[5] + ";\n\t\t\t" + (/*position*/ ctx[5] === "absolute"
    			? "top:0;right:0;bottom:0;left:0;"
    			: "") + "\n\t\t\t" + (/*pointerEvents*/ ctx[4] === false
    			? "pointer-events:none;"
    			: "") + "\n\t\t");

    			add_render_callback(() => /*div_elementresize_handler*/ ctx[56].call(div));
    			add_location(div, file, 308, 1, 9498);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			/*div_binding*/ ctx[55](div);
    			div_resize_listener = add_resize_listener(div, /*div_elementresize_handler*/ ctx[56].bind(div));
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty[0] & /*element, $width_d, $height_d, $aspectRatio_d, $_containerWidth, $_containerHeight*/ 1988 | dirty[1] & /*$$scope*/ 4194304) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[53], dirty, get_default_slot_changes, get_default_slot_context);
    				}
    			}

    			if (!current || dirty[0] & /*position, pointerEvents*/ 48 && div_style_value !== (div_style_value = "\n\t\t\tposition:" + /*position*/ ctx[5] + ";\n\t\t\t" + (/*position*/ ctx[5] === "absolute"
    			? "top:0;right:0;bottom:0;left:0;"
    			: "") + "\n\t\t\t" + (/*pointerEvents*/ ctx[4] === false
    			? "pointer-events:none;"
    			: "") + "\n\t\t")) {
    				attr_dev(div, "style", div_style_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			/*div_binding*/ ctx[55](null);
    			div_resize_listener();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(308:0) {#if (ssr === true || typeof window !== 'undefined')}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = (/*ssr*/ ctx[3] === true || typeof window !== "undefined") && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*ssr*/ ctx[3] === true || typeof window !== "undefined") {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*ssr*/ 8) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let context;
    	let $width_d;
    	let $height_d;
    	let $aspectRatio_d;
    	let $_containerWidth;
    	let $_containerHeight;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("LayerCake", slots, ['default']);
    	let { ssr = false } = $$props;
    	let { pointerEvents = true } = $$props;
    	let { position = "relative" } = $$props;
    	let { percentRange = false } = $$props;
    	let { width = undefined } = $$props;
    	let { height = undefined } = $$props;
    	let { containerWidth = width || 100 } = $$props;
    	let { containerHeight = height || 100 } = $$props;
    	let { element = undefined } = $$props;
    	let { x = undefined } = $$props;
    	let { y = undefined } = $$props;
    	let { z = undefined } = $$props;
    	let { r = undefined } = $$props;
    	let { custom = {} } = $$props;
    	let { data = [] } = $$props;
    	let { xDomain = undefined } = $$props;
    	let { yDomain = undefined } = $$props;
    	let { zDomain = undefined } = $$props;
    	let { rDomain = undefined } = $$props;
    	let { xNice = false } = $$props;
    	let { yNice = false } = $$props;
    	let { zNice = false } = $$props;
    	let { rNice = false } = $$props;
    	let { xReverse = defaultReverses.x } = $$props;
    	let { yReverse = defaultReverses.y } = $$props;
    	let { zReverse = defaultReverses.z } = $$props;
    	let { rReverse = defaultReverses.r } = $$props;
    	let { xPadding = undefined } = $$props;
    	let { yPadding = undefined } = $$props;
    	let { zPadding = undefined } = $$props;
    	let { rPadding = undefined } = $$props;
    	let { xScale = defaultScales.x } = $$props;
    	let { yScale = defaultScales.y } = $$props;
    	let { zScale = defaultScales.y } = $$props;
    	let { rScale = defaultScales.r } = $$props;
    	let { xRange = undefined } = $$props;
    	let { yRange = undefined } = $$props;
    	let { zRange = undefined } = $$props;
    	let { rRange = undefined } = $$props;
    	let { padding = {} } = $$props;
    	let { extents = {} } = $$props;
    	let { flatData = undefined } = $$props;

    	/* --------------------------------------------
     * Preserve a copy of our passed in settings before we modify them
     * Return this to the user's context so they can reference things if need be
     * Add the active keys since those aren't on our settings object.
     * This is mostly an escape-hatch
     */
    	const config = {};

    	/* --------------------------------------------
     * Make store versions of each parameter
     * Prefix these with `_` to keep things organized
     */
    	const _percentRange = writable();

    	const _containerWidth = writable();
    	validate_store(_containerWidth, "_containerWidth");
    	component_subscribe($$self, _containerWidth, value => $$invalidate(9, $_containerWidth = value));
    	const _containerHeight = writable();
    	validate_store(_containerHeight, "_containerHeight");
    	component_subscribe($$self, _containerHeight, value => $$invalidate(10, $_containerHeight = value));
    	const _x = writable();
    	const _y = writable();
    	const _z = writable();
    	const _r = writable();
    	const _custom = writable();
    	const _data = writable();
    	const _xDomain = writable();
    	const _yDomain = writable();
    	const _zDomain = writable();
    	const _rDomain = writable();
    	const _xNice = writable();
    	const _yNice = writable();
    	const _zNice = writable();
    	const _rNice = writable();
    	const _xReverse = writable();
    	const _yReverse = writable();
    	const _zReverse = writable();
    	const _rReverse = writable();
    	const _xPadding = writable();
    	const _yPadding = writable();
    	const _zPadding = writable();
    	const _rPadding = writable();
    	const _xScale = writable();
    	const _yScale = writable();
    	const _zScale = writable();
    	const _rScale = writable();
    	const _xRange = writable();
    	const _yRange = writable();
    	const _zRange = writable();
    	const _rRange = writable();
    	const _padding = writable();
    	const _flatData = writable();
    	const _extents = writable();
    	const _config = writable(config);

    	/* --------------------------------------------
     * Create derived values
     * Suffix these with `_d`
     */
    	const activeGetters_d = derived([_x, _y, _z, _r], ([$x, $y, $z, $r]) => {
    		const obj = {};

    		if ($x) {
    			obj.x = $x;
    		}

    		if ($y) {
    			obj.y = $y;
    		}

    		if ($z) {
    			obj.z = $z;
    		}

    		if ($r) {
    			obj.r = $r;
    		}

    		return obj;
    	});

    	const padding_d = derived([_padding, _containerWidth, _containerHeight], ([$padding]) => {
    		const defaultPadding = { top: 0, right: 0, bottom: 0, left: 0 };
    		return Object.assign(defaultPadding, $padding);
    	});

    	const box_d = derived([_containerWidth, _containerHeight, padding_d], ([$containerWidth, $containerHeight, $padding]) => {
    		const b = {};
    		b.top = $padding.top;
    		b.right = $containerWidth - $padding.right;
    		b.bottom = $containerHeight - $padding.bottom;
    		b.left = $padding.left;
    		b.width = b.right - b.left;
    		b.height = b.bottom - b.top;

    		if (b.width <= 0) {
    			console.error("[LayerCake] Target div has zero or negative width. Did you forget to set an explicit width in CSS on the container?");
    		}

    		if (b.height <= 0) {
    			console.error("[LayerCake] Target div has zero or negative height. Did you forget to set an explicit height in CSS on the container?");
    		}

    		return b;
    	});

    	const width_d = derived([box_d], ([$box]) => {
    		return $box.width;
    	});

    	validate_store(width_d, "width_d");
    	component_subscribe($$self, width_d, value => $$invalidate(6, $width_d = value));

    	const height_d = derived([box_d], ([$box]) => {
    		return $box.height;
    	});

    	validate_store(height_d, "height_d");
    	component_subscribe($$self, height_d, value => $$invalidate(7, $height_d = value));

    	/* --------------------------------------------
     * Calculate extents by taking the extent of the data
     * and filling that in with anything set by the user
     */
    	const extents_d = derived([_flatData, activeGetters_d, _extents], ([$flatData, $activeGetters, $extents]) => {
    		const getters = filterObject($activeGetters, $extents);

    		if (Object.keys(getters).length > 0) {
    			return {
    				...calcExtents($flatData, getters),
    				...$extents
    			};
    		} else {
    			return {};
    		}
    	});

    	const xDomain_d = derived([extents_d, _xDomain], calcDomain("x"));
    	const yDomain_d = derived([extents_d, _yDomain], calcDomain("y"));
    	const zDomain_d = derived([extents_d, _zDomain], calcDomain("z"));
    	const rDomain_d = derived([extents_d, _rDomain], calcDomain("r"));

    	const xScale_d = derived(
    		[
    			_xScale,
    			extents_d,
    			xDomain_d,
    			_xPadding,
    			_xNice,
    			_xReverse,
    			width_d,
    			height_d,
    			_xRange,
    			_percentRange
    		],
    		createScale("x")
    	);

    	const xGet_d = derived([_x, xScale_d], createGetter);

    	const yScale_d = derived(
    		[
    			_yScale,
    			extents_d,
    			yDomain_d,
    			_yPadding,
    			_yNice,
    			_yReverse,
    			width_d,
    			height_d,
    			_yRange,
    			_percentRange
    		],
    		createScale("y")
    	);

    	const yGet_d = derived([_y, yScale_d], createGetter);

    	const zScale_d = derived(
    		[
    			_zScale,
    			extents_d,
    			zDomain_d,
    			_zPadding,
    			_zNice,
    			_zReverse,
    			width_d,
    			height_d,
    			_zRange,
    			_percentRange
    		],
    		createScale("z")
    	);

    	const zGet_d = derived([_z, zScale_d], createGetter);

    	const rScale_d = derived(
    		[
    			_rScale,
    			extents_d,
    			rDomain_d,
    			_rPadding,
    			_rNice,
    			_rReverse,
    			width_d,
    			height_d,
    			_rRange,
    			_percentRange
    		],
    		createScale("r")
    	);

    	const rGet_d = derived([_r, rScale_d], createGetter);
    	const xRange_d = derived([xScale_d], getRange);
    	const yRange_d = derived([yScale_d], getRange);
    	const zRange_d = derived([zScale_d], getRange);
    	const rRange_d = derived([rScale_d], getRange);

    	const aspectRatio_d = derived([width_d, height_d], ([$width, $height]) => {
    		return $width / $height;
    	});

    	validate_store(aspectRatio_d, "aspectRatio_d");
    	component_subscribe($$self, aspectRatio_d, value => $$invalidate(8, $aspectRatio_d = value));

    	const writable_props = [
    		"ssr",
    		"pointerEvents",
    		"position",
    		"percentRange",
    		"width",
    		"height",
    		"containerWidth",
    		"containerHeight",
    		"element",
    		"x",
    		"y",
    		"z",
    		"r",
    		"custom",
    		"data",
    		"xDomain",
    		"yDomain",
    		"zDomain",
    		"rDomain",
    		"xNice",
    		"yNice",
    		"zNice",
    		"rNice",
    		"xReverse",
    		"yReverse",
    		"zReverse",
    		"rReverse",
    		"xPadding",
    		"yPadding",
    		"zPadding",
    		"rPadding",
    		"xScale",
    		"yScale",
    		"zScale",
    		"rScale",
    		"xRange",
    		"yRange",
    		"zRange",
    		"rRange",
    		"padding",
    		"extents",
    		"flatData"
    	];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<LayerCake> was created with unknown prop '${key}'`);
    	});

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			element = $$value;
    			$$invalidate(2, element);
    		});
    	}

    	function div_elementresize_handler() {
    		containerWidth = this.clientWidth;
    		containerHeight = this.clientHeight;
    		$$invalidate(0, containerWidth);
    		$$invalidate(1, containerHeight);
    	}

    	$$self.$$set = $$props => {
    		if ("ssr" in $$props) $$invalidate(3, ssr = $$props.ssr);
    		if ("pointerEvents" in $$props) $$invalidate(4, pointerEvents = $$props.pointerEvents);
    		if ("position" in $$props) $$invalidate(5, position = $$props.position);
    		if ("percentRange" in $$props) $$invalidate(16, percentRange = $$props.percentRange);
    		if ("width" in $$props) $$invalidate(17, width = $$props.width);
    		if ("height" in $$props) $$invalidate(18, height = $$props.height);
    		if ("containerWidth" in $$props) $$invalidate(0, containerWidth = $$props.containerWidth);
    		if ("containerHeight" in $$props) $$invalidate(1, containerHeight = $$props.containerHeight);
    		if ("element" in $$props) $$invalidate(2, element = $$props.element);
    		if ("x" in $$props) $$invalidate(19, x = $$props.x);
    		if ("y" in $$props) $$invalidate(20, y = $$props.y);
    		if ("z" in $$props) $$invalidate(21, z = $$props.z);
    		if ("r" in $$props) $$invalidate(22, r = $$props.r);
    		if ("custom" in $$props) $$invalidate(23, custom = $$props.custom);
    		if ("data" in $$props) $$invalidate(24, data = $$props.data);
    		if ("xDomain" in $$props) $$invalidate(25, xDomain = $$props.xDomain);
    		if ("yDomain" in $$props) $$invalidate(26, yDomain = $$props.yDomain);
    		if ("zDomain" in $$props) $$invalidate(27, zDomain = $$props.zDomain);
    		if ("rDomain" in $$props) $$invalidate(28, rDomain = $$props.rDomain);
    		if ("xNice" in $$props) $$invalidate(29, xNice = $$props.xNice);
    		if ("yNice" in $$props) $$invalidate(30, yNice = $$props.yNice);
    		if ("zNice" in $$props) $$invalidate(31, zNice = $$props.zNice);
    		if ("rNice" in $$props) $$invalidate(32, rNice = $$props.rNice);
    		if ("xReverse" in $$props) $$invalidate(33, xReverse = $$props.xReverse);
    		if ("yReverse" in $$props) $$invalidate(34, yReverse = $$props.yReverse);
    		if ("zReverse" in $$props) $$invalidate(35, zReverse = $$props.zReverse);
    		if ("rReverse" in $$props) $$invalidate(36, rReverse = $$props.rReverse);
    		if ("xPadding" in $$props) $$invalidate(37, xPadding = $$props.xPadding);
    		if ("yPadding" in $$props) $$invalidate(38, yPadding = $$props.yPadding);
    		if ("zPadding" in $$props) $$invalidate(39, zPadding = $$props.zPadding);
    		if ("rPadding" in $$props) $$invalidate(40, rPadding = $$props.rPadding);
    		if ("xScale" in $$props) $$invalidate(41, xScale = $$props.xScale);
    		if ("yScale" in $$props) $$invalidate(42, yScale = $$props.yScale);
    		if ("zScale" in $$props) $$invalidate(43, zScale = $$props.zScale);
    		if ("rScale" in $$props) $$invalidate(44, rScale = $$props.rScale);
    		if ("xRange" in $$props) $$invalidate(45, xRange = $$props.xRange);
    		if ("yRange" in $$props) $$invalidate(46, yRange = $$props.yRange);
    		if ("zRange" in $$props) $$invalidate(47, zRange = $$props.zRange);
    		if ("rRange" in $$props) $$invalidate(48, rRange = $$props.rRange);
    		if ("padding" in $$props) $$invalidate(49, padding = $$props.padding);
    		if ("extents" in $$props) $$invalidate(50, extents = $$props.extents);
    		if ("flatData" in $$props) $$invalidate(51, flatData = $$props.flatData);
    		if ("$$scope" in $$props) $$invalidate(53, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		setContext,
    		writable,
    		derived,
    		makeAccessor,
    		filterObject,
    		calcExtents,
    		calcDomain,
    		createScale,
    		createGetter,
    		getRange,
    		defaultScales,
    		defaultReverses,
    		ssr,
    		pointerEvents,
    		position,
    		percentRange,
    		width,
    		height,
    		containerWidth,
    		containerHeight,
    		element,
    		x,
    		y,
    		z,
    		r,
    		custom,
    		data,
    		xDomain,
    		yDomain,
    		zDomain,
    		rDomain,
    		xNice,
    		yNice,
    		zNice,
    		rNice,
    		xReverse,
    		yReverse,
    		zReverse,
    		rReverse,
    		xPadding,
    		yPadding,
    		zPadding,
    		rPadding,
    		xScale,
    		yScale,
    		zScale,
    		rScale,
    		xRange,
    		yRange,
    		zRange,
    		rRange,
    		padding,
    		extents,
    		flatData,
    		config,
    		_percentRange,
    		_containerWidth,
    		_containerHeight,
    		_x,
    		_y,
    		_z,
    		_r,
    		_custom,
    		_data,
    		_xDomain,
    		_yDomain,
    		_zDomain,
    		_rDomain,
    		_xNice,
    		_yNice,
    		_zNice,
    		_rNice,
    		_xReverse,
    		_yReverse,
    		_zReverse,
    		_rReverse,
    		_xPadding,
    		_yPadding,
    		_zPadding,
    		_rPadding,
    		_xScale,
    		_yScale,
    		_zScale,
    		_rScale,
    		_xRange,
    		_yRange,
    		_zRange,
    		_rRange,
    		_padding,
    		_flatData,
    		_extents,
    		_config,
    		activeGetters_d,
    		padding_d,
    		box_d,
    		width_d,
    		height_d,
    		extents_d,
    		xDomain_d,
    		yDomain_d,
    		zDomain_d,
    		rDomain_d,
    		xScale_d,
    		xGet_d,
    		yScale_d,
    		yGet_d,
    		zScale_d,
    		zGet_d,
    		rScale_d,
    		rGet_d,
    		xRange_d,
    		yRange_d,
    		zRange_d,
    		rRange_d,
    		aspectRatio_d,
    		context,
    		$width_d,
    		$height_d,
    		$aspectRatio_d,
    		$_containerWidth,
    		$_containerHeight
    	});

    	$$self.$inject_state = $$props => {
    		if ("ssr" in $$props) $$invalidate(3, ssr = $$props.ssr);
    		if ("pointerEvents" in $$props) $$invalidate(4, pointerEvents = $$props.pointerEvents);
    		if ("position" in $$props) $$invalidate(5, position = $$props.position);
    		if ("percentRange" in $$props) $$invalidate(16, percentRange = $$props.percentRange);
    		if ("width" in $$props) $$invalidate(17, width = $$props.width);
    		if ("height" in $$props) $$invalidate(18, height = $$props.height);
    		if ("containerWidth" in $$props) $$invalidate(0, containerWidth = $$props.containerWidth);
    		if ("containerHeight" in $$props) $$invalidate(1, containerHeight = $$props.containerHeight);
    		if ("element" in $$props) $$invalidate(2, element = $$props.element);
    		if ("x" in $$props) $$invalidate(19, x = $$props.x);
    		if ("y" in $$props) $$invalidate(20, y = $$props.y);
    		if ("z" in $$props) $$invalidate(21, z = $$props.z);
    		if ("r" in $$props) $$invalidate(22, r = $$props.r);
    		if ("custom" in $$props) $$invalidate(23, custom = $$props.custom);
    		if ("data" in $$props) $$invalidate(24, data = $$props.data);
    		if ("xDomain" in $$props) $$invalidate(25, xDomain = $$props.xDomain);
    		if ("yDomain" in $$props) $$invalidate(26, yDomain = $$props.yDomain);
    		if ("zDomain" in $$props) $$invalidate(27, zDomain = $$props.zDomain);
    		if ("rDomain" in $$props) $$invalidate(28, rDomain = $$props.rDomain);
    		if ("xNice" in $$props) $$invalidate(29, xNice = $$props.xNice);
    		if ("yNice" in $$props) $$invalidate(30, yNice = $$props.yNice);
    		if ("zNice" in $$props) $$invalidate(31, zNice = $$props.zNice);
    		if ("rNice" in $$props) $$invalidate(32, rNice = $$props.rNice);
    		if ("xReverse" in $$props) $$invalidate(33, xReverse = $$props.xReverse);
    		if ("yReverse" in $$props) $$invalidate(34, yReverse = $$props.yReverse);
    		if ("zReverse" in $$props) $$invalidate(35, zReverse = $$props.zReverse);
    		if ("rReverse" in $$props) $$invalidate(36, rReverse = $$props.rReverse);
    		if ("xPadding" in $$props) $$invalidate(37, xPadding = $$props.xPadding);
    		if ("yPadding" in $$props) $$invalidate(38, yPadding = $$props.yPadding);
    		if ("zPadding" in $$props) $$invalidate(39, zPadding = $$props.zPadding);
    		if ("rPadding" in $$props) $$invalidate(40, rPadding = $$props.rPadding);
    		if ("xScale" in $$props) $$invalidate(41, xScale = $$props.xScale);
    		if ("yScale" in $$props) $$invalidate(42, yScale = $$props.yScale);
    		if ("zScale" in $$props) $$invalidate(43, zScale = $$props.zScale);
    		if ("rScale" in $$props) $$invalidate(44, rScale = $$props.rScale);
    		if ("xRange" in $$props) $$invalidate(45, xRange = $$props.xRange);
    		if ("yRange" in $$props) $$invalidate(46, yRange = $$props.yRange);
    		if ("zRange" in $$props) $$invalidate(47, zRange = $$props.zRange);
    		if ("rRange" in $$props) $$invalidate(48, rRange = $$props.rRange);
    		if ("padding" in $$props) $$invalidate(49, padding = $$props.padding);
    		if ("extents" in $$props) $$invalidate(50, extents = $$props.extents);
    		if ("flatData" in $$props) $$invalidate(51, flatData = $$props.flatData);
    		if ("context" in $$props) $$invalidate(52, context = $$props.context);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*x*/ 524288) {
    			if (x) config.x = x;
    		}

    		if ($$self.$$.dirty[0] & /*y*/ 1048576) {
    			if (y) config.y = y;
    		}

    		if ($$self.$$.dirty[0] & /*z*/ 2097152) {
    			if (z) config.z = z;
    		}

    		if ($$self.$$.dirty[0] & /*r*/ 4194304) {
    			if (r) config.r = r;
    		}

    		if ($$self.$$.dirty[0] & /*xDomain*/ 33554432) {
    			if (xDomain) config.xDomain = xDomain;
    		}

    		if ($$self.$$.dirty[0] & /*yDomain*/ 67108864) {
    			if (yDomain) config.yDomain = yDomain;
    		}

    		if ($$self.$$.dirty[0] & /*zDomain*/ 134217728) {
    			if (zDomain) config.zDomain = zDomain;
    		}

    		if ($$self.$$.dirty[0] & /*rDomain*/ 268435456) {
    			if (rDomain) config.rDomain = rDomain;
    		}

    		if ($$self.$$.dirty[1] & /*xRange*/ 16384) {
    			if (xRange) config.xRange = xRange;
    		}

    		if ($$self.$$.dirty[1] & /*yRange*/ 32768) {
    			if (yRange) config.yRange = yRange;
    		}

    		if ($$self.$$.dirty[1] & /*zRange*/ 65536) {
    			if (zRange) config.zRange = zRange;
    		}

    		if ($$self.$$.dirty[1] & /*rRange*/ 131072) {
    			if (rRange) config.rRange = rRange;
    		}

    		if ($$self.$$.dirty[0] & /*percentRange*/ 65536) {
    			_percentRange.set(percentRange);
    		}

    		if ($$self.$$.dirty[0] & /*containerWidth*/ 1) {
    			_containerWidth.set(containerWidth);
    		}

    		if ($$self.$$.dirty[0] & /*containerHeight*/ 2) {
    			_containerHeight.set(containerHeight);
    		}

    		if ($$self.$$.dirty[0] & /*x*/ 524288) {
    			_x.set(makeAccessor(x));
    		}

    		if ($$self.$$.dirty[0] & /*y*/ 1048576) {
    			_y.set(makeAccessor(y));
    		}

    		if ($$self.$$.dirty[0] & /*z*/ 2097152) {
    			_z.set(makeAccessor(z));
    		}

    		if ($$self.$$.dirty[0] & /*r*/ 4194304) {
    			_r.set(makeAccessor(r));
    		}

    		if ($$self.$$.dirty[0] & /*xDomain*/ 33554432) {
    			_xDomain.set(xDomain);
    		}

    		if ($$self.$$.dirty[0] & /*yDomain*/ 67108864) {
    			_yDomain.set(yDomain);
    		}

    		if ($$self.$$.dirty[0] & /*zDomain*/ 134217728) {
    			_zDomain.set(zDomain);
    		}

    		if ($$self.$$.dirty[0] & /*rDomain*/ 268435456) {
    			_rDomain.set(rDomain);
    		}

    		if ($$self.$$.dirty[0] & /*custom*/ 8388608) {
    			_custom.set(custom);
    		}

    		if ($$self.$$.dirty[0] & /*data*/ 16777216) {
    			_data.set(data);
    		}

    		if ($$self.$$.dirty[0] & /*xNice*/ 536870912) {
    			_xNice.set(xNice);
    		}

    		if ($$self.$$.dirty[0] & /*yNice*/ 1073741824) {
    			_yNice.set(yNice);
    		}

    		if ($$self.$$.dirty[1] & /*zNice*/ 1) {
    			_zNice.set(zNice);
    		}

    		if ($$self.$$.dirty[1] & /*rNice*/ 2) {
    			_rNice.set(rNice);
    		}

    		if ($$self.$$.dirty[1] & /*xReverse*/ 4) {
    			_xReverse.set(xReverse);
    		}

    		if ($$self.$$.dirty[1] & /*yReverse*/ 8) {
    			_yReverse.set(yReverse);
    		}

    		if ($$self.$$.dirty[1] & /*zReverse*/ 16) {
    			_zReverse.set(zReverse);
    		}

    		if ($$self.$$.dirty[1] & /*rReverse*/ 32) {
    			_rReverse.set(rReverse);
    		}

    		if ($$self.$$.dirty[1] & /*xPadding*/ 64) {
    			_xPadding.set(xPadding);
    		}

    		if ($$self.$$.dirty[1] & /*yPadding*/ 128) {
    			_yPadding.set(yPadding);
    		}

    		if ($$self.$$.dirty[1] & /*zPadding*/ 256) {
    			_zPadding.set(zPadding);
    		}

    		if ($$self.$$.dirty[1] & /*rPadding*/ 512) {
    			_rPadding.set(rPadding);
    		}

    		if ($$self.$$.dirty[1] & /*xScale*/ 1024) {
    			_xScale.set(xScale);
    		}

    		if ($$self.$$.dirty[1] & /*yScale*/ 2048) {
    			_yScale.set(yScale);
    		}

    		if ($$self.$$.dirty[1] & /*zScale*/ 4096) {
    			_zScale.set(zScale);
    		}

    		if ($$self.$$.dirty[1] & /*rScale*/ 8192) {
    			_rScale.set(rScale);
    		}

    		if ($$self.$$.dirty[1] & /*xRange*/ 16384) {
    			_xRange.set(xRange);
    		}

    		if ($$self.$$.dirty[1] & /*yRange*/ 32768) {
    			_yRange.set(yRange);
    		}

    		if ($$self.$$.dirty[1] & /*zRange*/ 65536) {
    			_zRange.set(zRange);
    		}

    		if ($$self.$$.dirty[1] & /*rRange*/ 131072) {
    			_rRange.set(rRange);
    		}

    		if ($$self.$$.dirty[1] & /*padding*/ 262144) {
    			_padding.set(padding);
    		}

    		if ($$self.$$.dirty[1] & /*extents*/ 524288) {
    			_extents.set(filterObject(extents));
    		}

    		if ($$self.$$.dirty[0] & /*data*/ 16777216 | $$self.$$.dirty[1] & /*flatData*/ 1048576) {
    			_flatData.set(flatData || data);
    		}

    		if ($$self.$$.dirty[1] & /*context*/ 2097152) {
    			setContext("LayerCake", context);
    		}
    	};

    	$$invalidate(52, context = {
    		activeGetters: activeGetters_d,
    		width: width_d,
    		height: height_d,
    		percentRange: _percentRange,
    		aspectRatio: aspectRatio_d,
    		containerWidth: _containerWidth,
    		containerHeight: _containerHeight,
    		x: _x,
    		y: _y,
    		z: _z,
    		r: _r,
    		custom: _custom,
    		data: _data,
    		xNice: _xNice,
    		yNice: _yNice,
    		zNice: _zNice,
    		rNice: _rNice,
    		xReverse: _xReverse,
    		yReverse: _yReverse,
    		zReverse: _zReverse,
    		rReverse: _rReverse,
    		xPadding: _xPadding,
    		yPadding: _yPadding,
    		zPadding: _zPadding,
    		rPadding: _rPadding,
    		padding: padding_d,
    		flatData: _flatData,
    		extents: extents_d,
    		xDomain: xDomain_d,
    		yDomain: yDomain_d,
    		zDomain: zDomain_d,
    		rDomain: rDomain_d,
    		xRange: xRange_d,
    		yRange: yRange_d,
    		zRange: zRange_d,
    		rRange: rRange_d,
    		config: _config,
    		xScale: xScale_d,
    		xGet: xGet_d,
    		yScale: yScale_d,
    		yGet: yGet_d,
    		zScale: zScale_d,
    		zGet: zGet_d,
    		rScale: rScale_d,
    		rGet: rGet_d
    	});

    	return [
    		containerWidth,
    		containerHeight,
    		element,
    		ssr,
    		pointerEvents,
    		position,
    		$width_d,
    		$height_d,
    		$aspectRatio_d,
    		$_containerWidth,
    		$_containerHeight,
    		_containerWidth,
    		_containerHeight,
    		width_d,
    		height_d,
    		aspectRatio_d,
    		percentRange,
    		width,
    		height,
    		x,
    		y,
    		z,
    		r,
    		custom,
    		data,
    		xDomain,
    		yDomain,
    		zDomain,
    		rDomain,
    		xNice,
    		yNice,
    		zNice,
    		rNice,
    		xReverse,
    		yReverse,
    		zReverse,
    		rReverse,
    		xPadding,
    		yPadding,
    		zPadding,
    		rPadding,
    		xScale,
    		yScale,
    		zScale,
    		rScale,
    		xRange,
    		yRange,
    		zRange,
    		rRange,
    		padding,
    		extents,
    		flatData,
    		context,
    		$$scope,
    		slots,
    		div_binding,
    		div_elementresize_handler
    	];
    }

    class LayerCake extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance,
    			create_fragment,
    			safe_not_equal,
    			{
    				ssr: 3,
    				pointerEvents: 4,
    				position: 5,
    				percentRange: 16,
    				width: 17,
    				height: 18,
    				containerWidth: 0,
    				containerHeight: 1,
    				element: 2,
    				x: 19,
    				y: 20,
    				z: 21,
    				r: 22,
    				custom: 23,
    				data: 24,
    				xDomain: 25,
    				yDomain: 26,
    				zDomain: 27,
    				rDomain: 28,
    				xNice: 29,
    				yNice: 30,
    				zNice: 31,
    				rNice: 32,
    				xReverse: 33,
    				yReverse: 34,
    				zReverse: 35,
    				rReverse: 36,
    				xPadding: 37,
    				yPadding: 38,
    				zPadding: 39,
    				rPadding: 40,
    				xScale: 41,
    				yScale: 42,
    				zScale: 43,
    				rScale: 44,
    				xRange: 45,
    				yRange: 46,
    				zRange: 47,
    				rRange: 48,
    				padding: 49,
    				extents: 50,
    				flatData: 51
    			},
    			[-1, -1, -1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LayerCake",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get ssr() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ssr(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get pointerEvents() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pointerEvents(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get position() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set position(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get percentRange() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set percentRange(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get width() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get height() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set height(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get containerWidth() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set containerWidth(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get containerHeight() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set containerHeight(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get element() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set element(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get x() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set x(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get y() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set y(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get z() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set z(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get r() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set r(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get custom() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set custom(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get data() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get xDomain() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set xDomain(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get yDomain() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set yDomain(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get zDomain() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set zDomain(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rDomain() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rDomain(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get xNice() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set xNice(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get yNice() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set yNice(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get zNice() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set zNice(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rNice() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rNice(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get xReverse() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set xReverse(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get yReverse() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set yReverse(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get zReverse() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set zReverse(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rReverse() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rReverse(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get xPadding() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set xPadding(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get yPadding() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set yPadding(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get zPadding() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set zPadding(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rPadding() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rPadding(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get xScale() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set xScale(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get yScale() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set yScale(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get zScale() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set zScale(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rScale() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rScale(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get xRange() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set xRange(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get yRange() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set yRange(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get zRange() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set zRange(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rRange() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rRange(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get padding() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set padding(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get extents() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set extents(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get flatData() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set flatData(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/layercake/src/layouts/Html.svelte generated by Svelte v3.32.2 */
    const file$1 = "node_modules/layercake/src/layouts/Html.svelte";
    const get_default_slot_changes$1 = dirty => ({ element: dirty & /*element*/ 1 });
    const get_default_slot_context$1 = ctx => ({ element: /*element*/ ctx[0] });

    function create_fragment$1(ctx) {
    	let div;
    	let div_style_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[8].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[7], get_default_slot_context$1);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "layercake-layout-html svelte-1bu60uu");
    			attr_dev(div, "style", div_style_value = "top: " + /*$padding*/ ctx[3].top + "px; right:" + /*$padding*/ ctx[3].right + "px; bottom:" + /*$padding*/ ctx[3].bottom + "px; left:" + /*$padding*/ ctx[3].left + "px;" + /*zIndexStyle*/ ctx[1] + /*pointerEventsStyle*/ ctx[2]);
    			add_location(div, file$1, 16, 0, 422);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			/*div_binding*/ ctx[9](div);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope, element*/ 129) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[7], dirty, get_default_slot_changes$1, get_default_slot_context$1);
    				}
    			}

    			if (!current || dirty & /*$padding, zIndexStyle, pointerEventsStyle*/ 14 && div_style_value !== (div_style_value = "top: " + /*$padding*/ ctx[3].top + "px; right:" + /*$padding*/ ctx[3].right + "px; bottom:" + /*$padding*/ ctx[3].bottom + "px; left:" + /*$padding*/ ctx[3].left + "px;" + /*zIndexStyle*/ ctx[1] + /*pointerEventsStyle*/ ctx[2])) {
    				attr_dev(div, "style", div_style_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			/*div_binding*/ ctx[9](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $padding;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Html", slots, ['default']);
    	let { element = undefined } = $$props;
    	let { zIndex = undefined } = $$props;
    	let { pointerEvents = undefined } = $$props;
    	let zIndexStyle = "";
    	let pointerEventsStyle = "";
    	const { padding } = getContext("LayerCake");
    	validate_store(padding, "padding");
    	component_subscribe($$self, padding, value => $$invalidate(3, $padding = value));
    	const writable_props = ["element", "zIndex", "pointerEvents"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Html> was created with unknown prop '${key}'`);
    	});

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			element = $$value;
    			$$invalidate(0, element);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("element" in $$props) $$invalidate(0, element = $$props.element);
    		if ("zIndex" in $$props) $$invalidate(5, zIndex = $$props.zIndex);
    		if ("pointerEvents" in $$props) $$invalidate(6, pointerEvents = $$props.pointerEvents);
    		if ("$$scope" in $$props) $$invalidate(7, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		element,
    		zIndex,
    		pointerEvents,
    		zIndexStyle,
    		pointerEventsStyle,
    		padding,
    		$padding
    	});

    	$$self.$inject_state = $$props => {
    		if ("element" in $$props) $$invalidate(0, element = $$props.element);
    		if ("zIndex" in $$props) $$invalidate(5, zIndex = $$props.zIndex);
    		if ("pointerEvents" in $$props) $$invalidate(6, pointerEvents = $$props.pointerEvents);
    		if ("zIndexStyle" in $$props) $$invalidate(1, zIndexStyle = $$props.zIndexStyle);
    		if ("pointerEventsStyle" in $$props) $$invalidate(2, pointerEventsStyle = $$props.pointerEventsStyle);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*zIndex*/ 32) {
    			$$invalidate(1, zIndexStyle = typeof zIndex !== "undefined"
    			? `z-index:${zIndex};`
    			: "");
    		}

    		if ($$self.$$.dirty & /*pointerEvents*/ 64) {
    			$$invalidate(2, pointerEventsStyle = pointerEvents === false ? "pointer-events:none;" : "");
    		}
    	};

    	return [
    		element,
    		zIndexStyle,
    		pointerEventsStyle,
    		$padding,
    		padding,
    		zIndex,
    		pointerEvents,
    		$$scope,
    		slots,
    		div_binding
    	];
    }

    class Html extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { element: 0, zIndex: 5, pointerEvents: 6 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Html",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get element() {
    		throw new Error("<Html>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set element(value) {
    		throw new Error("<Html>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get zIndex() {
    		throw new Error("<Html>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set zIndex(value) {
    		throw new Error("<Html>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get pointerEvents() {
    		throw new Error("<Html>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pointerEvents(value) {
    		throw new Error("<Html>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/layercake/src/layouts/Svg.svelte generated by Svelte v3.32.2 */
    const file$2 = "node_modules/layercake/src/layouts/Svg.svelte";
    const get_default_slot_changes$2 = dirty => ({ element: dirty & /*element*/ 1 });
    const get_default_slot_context$2 = ctx => ({ element: /*element*/ ctx[0] });
    const get_defs_slot_changes = dirty => ({ element: dirty & /*element*/ 1 });
    const get_defs_slot_context = ctx => ({ element: /*element*/ ctx[0] });

    function create_fragment$2(ctx) {
    	let svg;
    	let defs;
    	let g;
    	let g_transform_value;
    	let svg_style_value;
    	let current;
    	const defs_slot_template = /*#slots*/ ctx[13].defs;
    	const defs_slot = create_slot(defs_slot_template, ctx, /*$$scope*/ ctx[12], get_defs_slot_context);
    	const default_slot_template = /*#slots*/ ctx[13].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[12], get_default_slot_context$2);

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			defs = svg_element("defs");
    			if (defs_slot) defs_slot.c();
    			g = svg_element("g");
    			if (default_slot) default_slot.c();
    			add_location(defs, file$2, 24, 1, 652);
    			attr_dev(g, "class", "layercake-layout-svg_g");
    			attr_dev(g, "transform", g_transform_value = "translate(" + /*$padding*/ ctx[6].left + ", " + /*$padding*/ ctx[6].top + ")");
    			add_location(g, file$2, 27, 1, 697);
    			attr_dev(svg, "class", "layercake-layout-svg svelte-u84d8d");
    			attr_dev(svg, "viewBox", /*viewBox*/ ctx[1]);
    			attr_dev(svg, "width", /*$containerWidth*/ ctx[4]);
    			attr_dev(svg, "height", /*$containerHeight*/ ctx[5]);
    			attr_dev(svg, "style", svg_style_value = "" + (/*zIndexStyle*/ ctx[2] + /*pointerEventsStyle*/ ctx[3]));
    			add_location(svg, file$2, 16, 0, 487);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, defs);

    			if (defs_slot) {
    				defs_slot.m(defs, null);
    			}

    			append_dev(svg, g);

    			if (default_slot) {
    				default_slot.m(g, null);
    			}

    			/*svg_binding*/ ctx[14](svg);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (defs_slot) {
    				if (defs_slot.p && dirty & /*$$scope, element*/ 4097) {
    					update_slot(defs_slot, defs_slot_template, ctx, /*$$scope*/ ctx[12], dirty, get_defs_slot_changes, get_defs_slot_context);
    				}
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope, element*/ 4097) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[12], dirty, get_default_slot_changes$2, get_default_slot_context$2);
    				}
    			}

    			if (!current || dirty & /*$padding*/ 64 && g_transform_value !== (g_transform_value = "translate(" + /*$padding*/ ctx[6].left + ", " + /*$padding*/ ctx[6].top + ")")) {
    				attr_dev(g, "transform", g_transform_value);
    			}

    			if (!current || dirty & /*viewBox*/ 2) {
    				attr_dev(svg, "viewBox", /*viewBox*/ ctx[1]);
    			}

    			if (!current || dirty & /*$containerWidth*/ 16) {
    				attr_dev(svg, "width", /*$containerWidth*/ ctx[4]);
    			}

    			if (!current || dirty & /*$containerHeight*/ 32) {
    				attr_dev(svg, "height", /*$containerHeight*/ ctx[5]);
    			}

    			if (!current || dirty & /*zIndexStyle, pointerEventsStyle*/ 12 && svg_style_value !== (svg_style_value = "" + (/*zIndexStyle*/ ctx[2] + /*pointerEventsStyle*/ ctx[3]))) {
    				attr_dev(svg, "style", svg_style_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(defs_slot, local);
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(defs_slot, local);
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			if (defs_slot) defs_slot.d(detaching);
    			if (default_slot) default_slot.d(detaching);
    			/*svg_binding*/ ctx[14](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $containerWidth;
    	let $containerHeight;
    	let $padding;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Svg", slots, ['defs','default']);
    	let { element = undefined } = $$props;
    	let { viewBox = undefined } = $$props;
    	let { zIndex = undefined } = $$props;
    	let { pointerEvents = undefined } = $$props;
    	let zIndexStyle = "";
    	let pointerEventsStyle = "";
    	const { containerWidth, containerHeight, padding } = getContext("LayerCake");
    	validate_store(containerWidth, "containerWidth");
    	component_subscribe($$self, containerWidth, value => $$invalidate(4, $containerWidth = value));
    	validate_store(containerHeight, "containerHeight");
    	component_subscribe($$self, containerHeight, value => $$invalidate(5, $containerHeight = value));
    	validate_store(padding, "padding");
    	component_subscribe($$self, padding, value => $$invalidate(6, $padding = value));
    	const writable_props = ["element", "viewBox", "zIndex", "pointerEvents"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Svg> was created with unknown prop '${key}'`);
    	});

    	function svg_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			element = $$value;
    			$$invalidate(0, element);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("element" in $$props) $$invalidate(0, element = $$props.element);
    		if ("viewBox" in $$props) $$invalidate(1, viewBox = $$props.viewBox);
    		if ("zIndex" in $$props) $$invalidate(10, zIndex = $$props.zIndex);
    		if ("pointerEvents" in $$props) $$invalidate(11, pointerEvents = $$props.pointerEvents);
    		if ("$$scope" in $$props) $$invalidate(12, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		element,
    		viewBox,
    		zIndex,
    		pointerEvents,
    		zIndexStyle,
    		pointerEventsStyle,
    		containerWidth,
    		containerHeight,
    		padding,
    		$containerWidth,
    		$containerHeight,
    		$padding
    	});

    	$$self.$inject_state = $$props => {
    		if ("element" in $$props) $$invalidate(0, element = $$props.element);
    		if ("viewBox" in $$props) $$invalidate(1, viewBox = $$props.viewBox);
    		if ("zIndex" in $$props) $$invalidate(10, zIndex = $$props.zIndex);
    		if ("pointerEvents" in $$props) $$invalidate(11, pointerEvents = $$props.pointerEvents);
    		if ("zIndexStyle" in $$props) $$invalidate(2, zIndexStyle = $$props.zIndexStyle);
    		if ("pointerEventsStyle" in $$props) $$invalidate(3, pointerEventsStyle = $$props.pointerEventsStyle);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*zIndex*/ 1024) {
    			$$invalidate(2, zIndexStyle = typeof zIndex !== "undefined"
    			? `z-index:${zIndex};`
    			: "");
    		}

    		if ($$self.$$.dirty & /*pointerEvents*/ 2048) {
    			$$invalidate(3, pointerEventsStyle = pointerEvents === false ? "pointer-events:none;" : "");
    		}
    	};

    	return [
    		element,
    		viewBox,
    		zIndexStyle,
    		pointerEventsStyle,
    		$containerWidth,
    		$containerHeight,
    		$padding,
    		containerWidth,
    		containerHeight,
    		padding,
    		zIndex,
    		pointerEvents,
    		$$scope,
    		slots,
    		svg_binding
    	];
    }

    class Svg extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			element: 0,
    			viewBox: 1,
    			zIndex: 10,
    			pointerEvents: 11
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Svg",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get element() {
    		throw new Error("<Svg>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set element(value) {
    		throw new Error("<Svg>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get viewBox() {
    		throw new Error("<Svg>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set viewBox(value) {
    		throw new Error("<Svg>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get zIndex() {
    		throw new Error("<Svg>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set zIndex(value) {
    		throw new Error("<Svg>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get pointerEvents() {
    		throw new Error("<Svg>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pointerEvents(value) {
    		throw new Error("<Svg>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/MultiLine.svelte generated by Svelte v3.32.2 */
    const file$3 = "src/components/MultiLine.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	return child_ctx;
    }

    // (19:2) {#each $data as group}
    function create_each_block(ctx) {
    	let path_1;
    	let path_1_d_value;
    	let path_1_stroke_value;

    	const block = {
    		c: function create() {
    			path_1 = svg_element("path");
    			attr_dev(path_1, "class", "path-line svelte-13zsz2g");
    			attr_dev(path_1, "d", path_1_d_value = /*path*/ ctx[0](/*group*/ ctx[9].values));
    			attr_dev(path_1, "stroke", path_1_stroke_value = /*$zGet*/ ctx[2](/*group*/ ctx[9]));
    			add_location(path_1, file$3, 19, 4, 479);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path_1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*path, $data*/ 3 && path_1_d_value !== (path_1_d_value = /*path*/ ctx[0](/*group*/ ctx[9].values))) {
    				attr_dev(path_1, "d", path_1_d_value);
    			}

    			if (dirty & /*$zGet, $data*/ 6 && path_1_stroke_value !== (path_1_stroke_value = /*$zGet*/ ctx[2](/*group*/ ctx[9]))) {
    				attr_dev(path_1, "stroke", path_1_stroke_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(19:2) {#each $data as group}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let g;
    	let each_value = /*$data*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			g = svg_element("g");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(g, "class", "line-group");
    			add_location(g, file$3, 17, 0, 427);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(g, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*path, $data, $zGet*/ 7) {
    				each_value = /*$data*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(g, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let path;
    	let $xGet;
    	let $yGet;
    	let $data;
    	let $zGet;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("MultiLine", slots, []);
    	const { data, xGet, yGet, zGet } = getContext("LayerCake");
    	validate_store(data, "data");
    	component_subscribe($$self, data, value => $$invalidate(1, $data = value));
    	validate_store(xGet, "xGet");
    	component_subscribe($$self, xGet, value => $$invalidate(7, $xGet = value));
    	validate_store(yGet, "yGet");
    	component_subscribe($$self, yGet, value => $$invalidate(8, $yGet = value));
    	validate_store(zGet, "zGet");
    	component_subscribe($$self, zGet, value => $$invalidate(2, $zGet = value));
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<MultiLine> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		getContext,
    		data,
    		xGet,
    		yGet,
    		zGet,
    		path,
    		$xGet,
    		$yGet,
    		$data,
    		$zGet
    	});

    	$$self.$inject_state = $$props => {
    		if ("path" in $$props) $$invalidate(0, path = $$props.path);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$xGet, $yGet*/ 384) {
    			$$invalidate(0, path = values => {
    				return "M" + values.map(d => {
    					return $xGet(d) + "," + $yGet(d);
    				}).join("L");
    			});
    		}
    	};

    	return [path, $data, $zGet, data, xGet, yGet, zGet, $xGet, $yGet];
    }

    class MultiLine extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MultiLine",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/components/AxisX.svelte generated by Svelte v3.32.2 */
    const file$4 = "src/components/AxisX.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[19] = list[i];
    	child_ctx[21] = i;
    	return child_ctx;
    }

    // (52:4) {#if i%5==0}
    function create_if_block_1(ctx) {
    	let g;
    	let if_block0_anchor;
    	let text_1;
    	let t_value = /*formatTick*/ ctx[4](/*tick*/ ctx[19]) + "";
    	let t;
    	let text_1_x_value;
    	let if_block2_anchor;
    	let if_block3_anchor;
    	let g_transform_value;
    	let if_block0 = /*gridlines*/ ctx[0] !== false && create_if_block_6(ctx);
    	let if_block1 = /*tickMarks*/ ctx[1] === true && create_if_block_5(ctx);
    	let if_block2 = /*i*/ ctx[21] == 0 && create_if_block_4(ctx);
    	let if_block3 = /*i*/ ctx[21] == 15 && create_if_block_3(ctx);
    	let if_block4 = /*i*/ ctx[21] == 25 && create_if_block_2(ctx);

    	const block = {
    		c: function create() {
    			g = svg_element("g");
    			if (if_block0) if_block0.c();
    			if_block0_anchor = empty();
    			if (if_block1) if_block1.c();
    			text_1 = svg_element("text");
    			t = text(t_value);
    			if (if_block2) if_block2.c();
    			if_block2_anchor = empty();
    			if (if_block3) if_block3.c();
    			if_block3_anchor = empty();
    			if (if_block4) if_block4.c();

    			attr_dev(text_1, "x", text_1_x_value = /*xTick*/ ctx[5] || /*isBandwidth*/ ctx[7]
    			? /*$xScale*/ ctx[8].bandwidth() / 2
    			: 0);

    			attr_dev(text_1, "y", /*yTick*/ ctx[6]);
    			attr_dev(text_1, "dx", "");
    			attr_dev(text_1, "dy", "");
    			attr_dev(text_1, "text-anchor", /*textAnchor*/ ctx[17](/*i*/ ctx[21]));
    			attr_dev(text_1, "class", "svelte-2vhegz");
    			add_location(text_1, file$4, 59, 8, 2629);
    			attr_dev(g, "class", "tick tick-" + /*i*/ ctx[21] + " svelte-2vhegz");
    			attr_dev(g, "transform", g_transform_value = "translate(" + /*$xScale*/ ctx[8](/*tick*/ ctx[19]) + "," + /*$yRange*/ ctx[10][0] * 0.66 + ")");
    			add_location(g, file$4, 52, 6, 2183);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g, anchor);
    			if (if_block0) if_block0.m(g, null);
    			append_dev(g, if_block0_anchor);
    			if (if_block1) if_block1.m(g, null);
    			append_dev(g, text_1);
    			append_dev(text_1, t);
    			if (if_block2) if_block2.m(g, null);
    			append_dev(g, if_block2_anchor);
    			if (if_block3) if_block3.m(g, null);
    			append_dev(g, if_block3_anchor);
    			if (if_block4) if_block4.m(g, null);
    		},
    		p: function update(ctx, dirty) {
    			if (/*gridlines*/ ctx[0] !== false) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_6(ctx);
    					if_block0.c();
    					if_block0.m(g, if_block0_anchor);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*tickMarks*/ ctx[1] === true) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_5(ctx);
    					if_block1.c();
    					if_block1.m(g, text_1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty & /*formatTick, tickVals*/ 528 && t_value !== (t_value = /*formatTick*/ ctx[4](/*tick*/ ctx[19]) + "")) set_data_dev(t, t_value);

    			if (dirty & /*xTick, isBandwidth, $xScale*/ 416 && text_1_x_value !== (text_1_x_value = /*xTick*/ ctx[5] || /*isBandwidth*/ ctx[7]
    			? /*$xScale*/ ctx[8].bandwidth() / 2
    			: 0)) {
    				attr_dev(text_1, "x", text_1_x_value);
    			}

    			if (dirty & /*yTick*/ 64) {
    				attr_dev(text_1, "y", /*yTick*/ ctx[6]);
    			}

    			if (/*i*/ ctx[21] == 0) if_block2.p(ctx, dirty);
    			if (/*i*/ ctx[21] == 15) if_block3.p(ctx, dirty);
    			if (/*i*/ ctx[21] == 25) if_block4.p(ctx, dirty);

    			if (dirty & /*$xScale, tickVals, $yRange*/ 1792 && g_transform_value !== (g_transform_value = "translate(" + /*$xScale*/ ctx[8](/*tick*/ ctx[19]) + "," + /*$yRange*/ ctx[10][0] * 0.66 + ")")) {
    				attr_dev(g, "transform", g_transform_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
    			if (if_block4) if_block4.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(52:4) {#if i%5==0}",
    		ctx
    	});

    	return block;
    }

    // (54:8) {#if gridlines !== false}
    function create_if_block_6(ctx) {
    	let line;
    	let line_y__value;

    	const block = {
    		c: function create() {
    			line = svg_element("line");
    			attr_dev(line, "class", "gridline svelte-2vhegz");
    			attr_dev(line, "y1", line_y__value = /*$height*/ ctx[11] * -1);
    			attr_dev(line, "y2", "0");
    			attr_dev(line, "x1", "0");
    			attr_dev(line, "x2", "0");
    			add_location(line, file$4, 54, 10, 2312);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, line, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$height*/ 2048 && line_y__value !== (line_y__value = /*$height*/ ctx[11] * -1)) {
    				attr_dev(line, "y1", line_y__value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(line);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(54:8) {#if gridlines !== false}",
    		ctx
    	});

    	return block;
    }

    // (57:8) {#if tickMarks === true}
    function create_if_block_5(ctx) {
    	let line;
    	let line_x__value;
    	let line_x__value_1;

    	const block = {
    		c: function create() {
    			line = svg_element("line");
    			attr_dev(line, "class", "tick-mark svelte-2vhegz");
    			attr_dev(line, "y1", 0);
    			attr_dev(line, "y2", 6);

    			attr_dev(line, "x1", line_x__value = /*xTick*/ ctx[5] || /*isBandwidth*/ ctx[7]
    			? /*$xScale*/ ctx[8].bandwidth() / 2
    			: 0);

    			attr_dev(line, "x2", line_x__value_1 = /*xTick*/ ctx[5] || /*isBandwidth*/ ctx[7]
    			? /*$xScale*/ ctx[8].bandwidth() / 2
    			: 0);

    			add_location(line, file$4, 57, 10, 2441);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, line, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*xTick, isBandwidth, $xScale*/ 416 && line_x__value !== (line_x__value = /*xTick*/ ctx[5] || /*isBandwidth*/ ctx[7]
    			? /*$xScale*/ ctx[8].bandwidth() / 2
    			: 0)) {
    				attr_dev(line, "x1", line_x__value);
    			}

    			if (dirty & /*xTick, isBandwidth, $xScale*/ 416 && line_x__value_1 !== (line_x__value_1 = /*xTick*/ ctx[5] || /*isBandwidth*/ ctx[7]
    			? /*$xScale*/ ctx[8].bandwidth() / 2
    			: 0)) {
    				attr_dev(line, "x2", line_x__value_1);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(line);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(57:8) {#if tickMarks === true}",
    		ctx
    	});

    	return block;
    }

    // (66:8) {#if i==0}
    function create_if_block_4(ctx) {
    	let text_1;
    	let t;
    	let text_1_x_value;

    	const block = {
    		c: function create() {
    			text_1 = svg_element("text");
    			t = text("2019");

    			attr_dev(text_1, "x", text_1_x_value = /*xTick*/ ctx[5] || /*isBandwidth*/ ctx[7]
    			? /*$xScale*/ ctx[8].bandwidth() / 2
    			: 0);

    			attr_dev(text_1, "y", "30");
    			attr_dev(text_1, "dx", "");
    			attr_dev(text_1, "dy", "");
    			attr_dev(text_1, "text-anchor", /*textAnchor*/ ctx[17](/*i*/ ctx[21]));
    			attr_dev(text_1, "class", "svelte-2vhegz");
    			add_location(text_1, file$4, 66, 8, 2862);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, text_1, anchor);
    			append_dev(text_1, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*xTick, isBandwidth, $xScale*/ 416 && text_1_x_value !== (text_1_x_value = /*xTick*/ ctx[5] || /*isBandwidth*/ ctx[7]
    			? /*$xScale*/ ctx[8].bandwidth() / 2
    			: 0)) {
    				attr_dev(text_1, "x", text_1_x_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(text_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(66:8) {#if i==0}",
    		ctx
    	});

    	return block;
    }

    // (75:8) {#if i==15}
    function create_if_block_3(ctx) {
    	let text_1;
    	let t;
    	let text_1_x_value;

    	const block = {
    		c: function create() {
    			text_1 = svg_element("text");
    			t = text("2020");

    			attr_dev(text_1, "x", text_1_x_value = /*xTick*/ ctx[5] || /*isBandwidth*/ ctx[7]
    			? /*$xScale*/ ctx[8].bandwidth() / 2
    			: 0);

    			attr_dev(text_1, "y", "30");
    			attr_dev(text_1, "dx", "");
    			attr_dev(text_1, "dy", "");
    			attr_dev(text_1, "text-anchor", /*textAnchor*/ ctx[17](/*i*/ ctx[21]));
    			attr_dev(text_1, "class", "svelte-2vhegz");
    			add_location(text_1, file$4, 75, 8, 3092);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, text_1, anchor);
    			append_dev(text_1, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*xTick, isBandwidth, $xScale*/ 416 && text_1_x_value !== (text_1_x_value = /*xTick*/ ctx[5] || /*isBandwidth*/ ctx[7]
    			? /*$xScale*/ ctx[8].bandwidth() / 2
    			: 0)) {
    				attr_dev(text_1, "x", text_1_x_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(text_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(75:8) {#if i==15}",
    		ctx
    	});

    	return block;
    }

    // (85:8) {#if i==25}
    function create_if_block_2(ctx) {
    	let text_1;
    	let t;
    	let text_1_x_value;

    	const block = {
    		c: function create() {
    			text_1 = svg_element("text");
    			t = text("2021");

    			attr_dev(text_1, "x", text_1_x_value = /*xTick*/ ctx[5] || /*isBandwidth*/ ctx[7]
    			? /*$xScale*/ ctx[8].bandwidth() / 2
    			: 0);

    			attr_dev(text_1, "y", "30");
    			attr_dev(text_1, "dx", "");
    			attr_dev(text_1, "dy", "");
    			attr_dev(text_1, "text-anchor", /*textAnchor*/ ctx[17](/*i*/ ctx[21]));
    			attr_dev(text_1, "class", "svelte-2vhegz");
    			add_location(text_1, file$4, 85, 8, 3323);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, text_1, anchor);
    			append_dev(text_1, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*xTick, isBandwidth, $xScale*/ 416 && text_1_x_value !== (text_1_x_value = /*xTick*/ ctx[5] || /*isBandwidth*/ ctx[7]
    			? /*$xScale*/ ctx[8].bandwidth() / 2
    			: 0)) {
    				attr_dev(text_1, "x", text_1_x_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(text_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(85:8) {#if i==25}",
    		ctx
    	});

    	return block;
    }

    // (51:2) {#each tickVals as tick, i}
    function create_each_block$1(ctx) {
    	let if_block_anchor;
    	let if_block = /*i*/ ctx[21] % 5 == 0 && create_if_block_1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*i*/ ctx[21] % 5 == 0) if_block.p(ctx, dirty);
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(51:2) {#each tickVals as tick, i}",
    		ctx
    	});

    	return block;
    }

    // (97:2) {#if baseline === true}
    function create_if_block$1(ctx) {
    	let line;
    	let line_y__value;
    	let line_y__value_1;

    	const block = {
    		c: function create() {
    			line = svg_element("line");
    			attr_dev(line, "class", "baseline svelte-2vhegz");
    			attr_dev(line, "y1", line_y__value = /*$height*/ ctx[11] + 0.5);
    			attr_dev(line, "y2", line_y__value_1 = /*$height*/ ctx[11] + 0.5);
    			attr_dev(line, "x1", "0");
    			attr_dev(line, "x2", /*$width*/ ctx[12]);
    			add_location(line, file$4, 97, 4, 3573);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, line, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$height*/ 2048 && line_y__value !== (line_y__value = /*$height*/ ctx[11] + 0.5)) {
    				attr_dev(line, "y1", line_y__value);
    			}

    			if (dirty & /*$height*/ 2048 && line_y__value_1 !== (line_y__value_1 = /*$height*/ ctx[11] + 0.5)) {
    				attr_dev(line, "y2", line_y__value_1);
    			}

    			if (dirty & /*$width*/ 4096) {
    				attr_dev(line, "x2", /*$width*/ ctx[12]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(line);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(97:2) {#if baseline === true}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let g;
    	let each_1_anchor;
    	let each_value = /*tickVals*/ ctx[9];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	let if_block = /*baseline*/ ctx[2] === true && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			g = svg_element("g");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    			if (if_block) if_block.c();
    			attr_dev(g, "class", "axis x-axis svelte-2vhegz");
    			toggle_class(g, "snapTicks", /*snapTicks*/ ctx[3]);
    			add_location(g, file$4, 49, 0, 2075);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(g, null);
    			}

    			append_dev(g, each_1_anchor);
    			if (if_block) if_block.m(g, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$xScale, tickVals, $yRange, xTick, isBandwidth, textAnchor, yTick, formatTick, tickMarks, $height, gridlines*/ 135155) {
    				each_value = /*tickVals*/ ctx[9];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(g, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (/*baseline*/ ctx[2] === true) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(g, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*snapTicks*/ 8) {
    				toggle_class(g, "snapTicks", /*snapTicks*/ ctx[3]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g);
    			destroy_each(each_blocks, detaching);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let isBandwidth;
    	let tickVals;
    	let $xScale;
    	let $yRange;
    	let $height;
    	let $width;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("AxisX", slots, []);
    	const { width, height, xScale, yRange } = getContext("LayerCake");
    	validate_store(width, "width");
    	component_subscribe($$self, width, value => $$invalidate(12, $width = value));
    	validate_store(height, "height");
    	component_subscribe($$self, height, value => $$invalidate(11, $height = value));
    	validate_store(xScale, "xScale");
    	component_subscribe($$self, xScale, value => $$invalidate(8, $xScale = value));
    	validate_store(yRange, "yRange");
    	component_subscribe($$self, yRange, value => $$invalidate(10, $yRange = value));
    	let { gridlines = true } = $$props;
    	let { tickMarks = false } = $$props;
    	let { baseline = false } = $$props;
    	let { snapTicks = false } = $$props;
    	let { formatTick = d => d } = $$props;
    	let { ticks = undefined } = $$props;
    	let { xTick = 0 } = $$props;
    	let { yTick = 16 } = $$props;

    	// console.log($xScale.ticks())
    	function textAnchor(i) {
    		if (snapTicks === true) {
    			if (i === 0) {
    				return "start";
    			}

    			if (i === tickVals.length - 1) {
    				return "end";
    			}
    		}

    		return "middle";
    	}

    	const writable_props = [
    		"gridlines",
    		"tickMarks",
    		"baseline",
    		"snapTicks",
    		"formatTick",
    		"ticks",
    		"xTick",
    		"yTick"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<AxisX> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("gridlines" in $$props) $$invalidate(0, gridlines = $$props.gridlines);
    		if ("tickMarks" in $$props) $$invalidate(1, tickMarks = $$props.tickMarks);
    		if ("baseline" in $$props) $$invalidate(2, baseline = $$props.baseline);
    		if ("snapTicks" in $$props) $$invalidate(3, snapTicks = $$props.snapTicks);
    		if ("formatTick" in $$props) $$invalidate(4, formatTick = $$props.formatTick);
    		if ("ticks" in $$props) $$invalidate(18, ticks = $$props.ticks);
    		if ("xTick" in $$props) $$invalidate(5, xTick = $$props.xTick);
    		if ("yTick" in $$props) $$invalidate(6, yTick = $$props.yTick);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		width,
    		height,
    		xScale,
    		yRange,
    		gridlines,
    		tickMarks,
    		baseline,
    		snapTicks,
    		formatTick,
    		ticks,
    		xTick,
    		yTick,
    		textAnchor,
    		isBandwidth,
    		$xScale,
    		tickVals,
    		$yRange,
    		$height,
    		$width
    	});

    	$$self.$inject_state = $$props => {
    		if ("gridlines" in $$props) $$invalidate(0, gridlines = $$props.gridlines);
    		if ("tickMarks" in $$props) $$invalidate(1, tickMarks = $$props.tickMarks);
    		if ("baseline" in $$props) $$invalidate(2, baseline = $$props.baseline);
    		if ("snapTicks" in $$props) $$invalidate(3, snapTicks = $$props.snapTicks);
    		if ("formatTick" in $$props) $$invalidate(4, formatTick = $$props.formatTick);
    		if ("ticks" in $$props) $$invalidate(18, ticks = $$props.ticks);
    		if ("xTick" in $$props) $$invalidate(5, xTick = $$props.xTick);
    		if ("yTick" in $$props) $$invalidate(6, yTick = $$props.yTick);
    		if ("isBandwidth" in $$props) $$invalidate(7, isBandwidth = $$props.isBandwidth);
    		if ("tickVals" in $$props) $$invalidate(9, tickVals = $$props.tickVals);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$xScale*/ 256) {
    			$$invalidate(7, isBandwidth = typeof $xScale.bandwidth === "function");
    		}

    		if ($$self.$$.dirty & /*ticks, isBandwidth, $xScale*/ 262528) {
    			$$invalidate(9, tickVals = Array.isArray(ticks)
    			? ticks
    			: isBandwidth
    				? $xScale.domain()
    				: typeof ticks === "function"
    					? ticks($xScale.ticks())
    					: $xScale.ticks(ticks));
    		}
    	};

    	return [
    		gridlines,
    		tickMarks,
    		baseline,
    		snapTicks,
    		formatTick,
    		xTick,
    		yTick,
    		isBandwidth,
    		$xScale,
    		tickVals,
    		$yRange,
    		$height,
    		$width,
    		width,
    		height,
    		xScale,
    		yRange,
    		textAnchor,
    		ticks
    	];
    }

    class AxisX extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {
    			gridlines: 0,
    			tickMarks: 1,
    			baseline: 2,
    			snapTicks: 3,
    			formatTick: 4,
    			ticks: 18,
    			xTick: 5,
    			yTick: 6
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AxisX",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get gridlines() {
    		throw new Error("<AxisX>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set gridlines(value) {
    		throw new Error("<AxisX>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tickMarks() {
    		throw new Error("<AxisX>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tickMarks(value) {
    		throw new Error("<AxisX>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get baseline() {
    		throw new Error("<AxisX>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set baseline(value) {
    		throw new Error("<AxisX>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get snapTicks() {
    		throw new Error("<AxisX>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set snapTicks(value) {
    		throw new Error("<AxisX>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get formatTick() {
    		throw new Error("<AxisX>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set formatTick(value) {
    		throw new Error("<AxisX>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ticks() {
    		throw new Error("<AxisX>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ticks(value) {
    		throw new Error("<AxisX>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get xTick() {
    		throw new Error("<AxisX>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set xTick(value) {
    		throw new Error("<AxisX>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get yTick() {
    		throw new Error("<AxisX>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set yTick(value) {
    		throw new Error("<AxisX>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/AxisY.svelte generated by Svelte v3.32.2 */
    const file$5 = "src/components/AxisY.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[17] = list[i];
    	return child_ctx;
    }

    // (41:4) {#if tick>=20}
    function create_if_block$2(ctx) {
    	let g;
    	let if_block0_anchor;
    	let text_1;
    	let t_value = /*formatTick*/ ctx[2](/*tick*/ ctx[17]) + "";
    	let t;
    	let text_1_y_value;
    	let text_1_dx_value;
    	let text_1_dy_value;
    	let g_class_value;
    	let g_transform_value;
    	let if_block0 = /*gridlines*/ ctx[0] !== false && create_if_block_2$1(ctx);
    	let if_block1 = /*tickMarks*/ ctx[1] === true && create_if_block_1$1(ctx);

    	const block = {
    		c: function create() {
    			g = svg_element("g");
    			if (if_block0) if_block0.c();
    			if_block0_anchor = empty();
    			if (if_block1) if_block1.c();
    			text_1 = svg_element("text");
    			t = text(t_value);
    			attr_dev(text_1, "x", /*xTick*/ ctx[3]);

    			attr_dev(text_1, "y", text_1_y_value = /*yTick*/ ctx[4] + (/*isBandwidth*/ ctx[8]
    			? /*$yScale*/ ctx[9].bandwidth() / 2
    			: 0));

    			attr_dev(text_1, "dx", text_1_dx_value = /*isBandwidth*/ ctx[8] ? -9 : /*dxTick*/ ctx[5]);
    			attr_dev(text_1, "dy", text_1_dy_value = /*isBandwidth*/ ctx[8] ? 4 : /*dyTick*/ ctx[6]);
    			set_style(text_1, "text-anchor", /*isBandwidth*/ ctx[8] ? "end" : /*textAnchor*/ ctx[7]);
    			attr_dev(text_1, "class", "svelte-1yyz0hg");
    			add_location(text_1, file$5, 59, 8, 2702);
    			attr_dev(g, "class", g_class_value = "tick tick-" + /*tick*/ ctx[17] + " svelte-1yyz0hg");
    			attr_dev(g, "transform", g_transform_value = "translate(" + (/*$xRange*/ ctx[12][0] + (/*isBandwidth*/ ctx[8] ? /*$padding*/ ctx[11].left : 0)) + ", " + /*$yScale*/ ctx[9](/*tick*/ ctx[17]) + ")");
    			add_location(g, file$5, 41, 6, 1987);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g, anchor);
    			if (if_block0) if_block0.m(g, null);
    			append_dev(g, if_block0_anchor);
    			if (if_block1) if_block1.m(g, null);
    			append_dev(g, text_1);
    			append_dev(text_1, t);
    		},
    		p: function update(ctx, dirty) {
    			if (/*gridlines*/ ctx[0] !== false) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_2$1(ctx);
    					if_block0.c();
    					if_block0.m(g, if_block0_anchor);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*tickMarks*/ ctx[1] === true) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_1$1(ctx);
    					if_block1.c();
    					if_block1.m(g, text_1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty & /*formatTick, tickVals*/ 1028 && t_value !== (t_value = /*formatTick*/ ctx[2](/*tick*/ ctx[17]) + "")) set_data_dev(t, t_value);

    			if (dirty & /*xTick*/ 8) {
    				attr_dev(text_1, "x", /*xTick*/ ctx[3]);
    			}

    			if (dirty & /*yTick, isBandwidth, $yScale*/ 784 && text_1_y_value !== (text_1_y_value = /*yTick*/ ctx[4] + (/*isBandwidth*/ ctx[8]
    			? /*$yScale*/ ctx[9].bandwidth() / 2
    			: 0))) {
    				attr_dev(text_1, "y", text_1_y_value);
    			}

    			if (dirty & /*isBandwidth, dxTick*/ 288 && text_1_dx_value !== (text_1_dx_value = /*isBandwidth*/ ctx[8] ? -9 : /*dxTick*/ ctx[5])) {
    				attr_dev(text_1, "dx", text_1_dx_value);
    			}

    			if (dirty & /*isBandwidth, dyTick*/ 320 && text_1_dy_value !== (text_1_dy_value = /*isBandwidth*/ ctx[8] ? 4 : /*dyTick*/ ctx[6])) {
    				attr_dev(text_1, "dy", text_1_dy_value);
    			}

    			if (dirty & /*isBandwidth, textAnchor*/ 384) {
    				set_style(text_1, "text-anchor", /*isBandwidth*/ ctx[8] ? "end" : /*textAnchor*/ ctx[7]);
    			}

    			if (dirty & /*tickVals*/ 1024 && g_class_value !== (g_class_value = "tick tick-" + /*tick*/ ctx[17] + " svelte-1yyz0hg")) {
    				attr_dev(g, "class", g_class_value);
    			}

    			if (dirty & /*$xRange, isBandwidth, $padding, $yScale, tickVals*/ 7936 && g_transform_value !== (g_transform_value = "translate(" + (/*$xRange*/ ctx[12][0] + (/*isBandwidth*/ ctx[8] ? /*$padding*/ ctx[11].left : 0)) + ", " + /*$yScale*/ ctx[9](/*tick*/ ctx[17]) + ")")) {
    				attr_dev(g, "transform", g_transform_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(41:4) {#if tick>=20}",
    		ctx
    	});

    	return block;
    }

    // (43:8) {#if gridlines !== false}
    function create_if_block_2$1(ctx) {
    	let line;
    	let line_y__value;
    	let line_y__value_1;

    	const block = {
    		c: function create() {
    			line = svg_element("line");
    			attr_dev(line, "class", "gridline svelte-1yyz0hg");
    			attr_dev(line, "x2", "100%");

    			attr_dev(line, "y1", line_y__value = /*yTick*/ ctx[4] + (/*isBandwidth*/ ctx[8]
    			? /*$yScale*/ ctx[9].bandwidth() / 2
    			: 0));

    			attr_dev(line, "y2", line_y__value_1 = /*yTick*/ ctx[4] + (/*isBandwidth*/ ctx[8]
    			? /*$yScale*/ ctx[9].bandwidth() / 2
    			: 0));

    			add_location(line, file$5, 43, 10, 2149);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, line, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*yTick, isBandwidth, $yScale*/ 784 && line_y__value !== (line_y__value = /*yTick*/ ctx[4] + (/*isBandwidth*/ ctx[8]
    			? /*$yScale*/ ctx[9].bandwidth() / 2
    			: 0))) {
    				attr_dev(line, "y1", line_y__value);
    			}

    			if (dirty & /*yTick, isBandwidth, $yScale*/ 784 && line_y__value_1 !== (line_y__value_1 = /*yTick*/ ctx[4] + (/*isBandwidth*/ ctx[8]
    			? /*$yScale*/ ctx[9].bandwidth() / 2
    			: 0))) {
    				attr_dev(line, "y2", line_y__value_1);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(line);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(43:8) {#if gridlines !== false}",
    		ctx
    	});

    	return block;
    }

    // (51:8) {#if tickMarks === true}
    function create_if_block_1$1(ctx) {
    	let line;
    	let line_x__value;
    	let line_y__value;
    	let line_y__value_1;

    	const block = {
    		c: function create() {
    			line = svg_element("line");
    			attr_dev(line, "class", "tick-mark svelte-1yyz0hg");
    			attr_dev(line, "x1", "0");
    			attr_dev(line, "x2", line_x__value = /*isBandwidth*/ ctx[8] ? -6 : 6);

    			attr_dev(line, "y1", line_y__value = /*yTick*/ ctx[4] + (/*isBandwidth*/ ctx[8]
    			? /*$yScale*/ ctx[9].bandwidth() / 2
    			: 0));

    			attr_dev(line, "y2", line_y__value_1 = /*yTick*/ ctx[4] + (/*isBandwidth*/ ctx[8]
    			? /*$yScale*/ ctx[9].bandwidth() / 2
    			: 0));

    			add_location(line, file$5, 51, 10, 2424);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, line, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*isBandwidth*/ 256 && line_x__value !== (line_x__value = /*isBandwidth*/ ctx[8] ? -6 : 6)) {
    				attr_dev(line, "x2", line_x__value);
    			}

    			if (dirty & /*yTick, isBandwidth, $yScale*/ 784 && line_y__value !== (line_y__value = /*yTick*/ ctx[4] + (/*isBandwidth*/ ctx[8]
    			? /*$yScale*/ ctx[9].bandwidth() / 2
    			: 0))) {
    				attr_dev(line, "y1", line_y__value);
    			}

    			if (dirty & /*yTick, isBandwidth, $yScale*/ 784 && line_y__value_1 !== (line_y__value_1 = /*yTick*/ ctx[4] + (/*isBandwidth*/ ctx[8]
    			? /*$yScale*/ ctx[9].bandwidth() / 2
    			: 0))) {
    				attr_dev(line, "y2", line_y__value_1);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(line);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(51:8) {#if tickMarks === true}",
    		ctx
    	});

    	return block;
    }

    // (39:2) {#each tickVals as tick}
    function create_each_block$2(ctx) {
    	let if_block_anchor;
    	let if_block = /*tick*/ ctx[17] >= 20 && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*tick*/ ctx[17] >= 20) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(39:2) {#each tickVals as tick}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let g;
    	let g_transform_value;
    	let each_value = /*tickVals*/ ctx[10];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			g = svg_element("g");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(g, "class", "axis y-axis");
    			attr_dev(g, "transform", g_transform_value = "translate(" + -/*$padding*/ ctx[11].left + ", 0)");
    			add_location(g, file$5, 37, 0, 1843);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(g, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*tickVals, $xRange, isBandwidth, $padding, $yScale, xTick, yTick, dxTick, dyTick, textAnchor, formatTick, tickMarks, gridlines*/ 8191) {
    				each_value = /*tickVals*/ ctx[10];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(g, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*$padding*/ 2048 && g_transform_value !== (g_transform_value = "translate(" + -/*$padding*/ ctx[11].left + ", 0)")) {
    				attr_dev(g, "transform", g_transform_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let isBandwidth;
    	let tickVals;
    	let $yScale;
    	let $padding;
    	let $xRange;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("AxisY", slots, []);
    	const { padding, xRange, yScale } = getContext("LayerCake");
    	validate_store(padding, "padding");
    	component_subscribe($$self, padding, value => $$invalidate(11, $padding = value));
    	validate_store(xRange, "xRange");
    	component_subscribe($$self, xRange, value => $$invalidate(12, $xRange = value));
    	validate_store(yScale, "yScale");
    	component_subscribe($$self, yScale, value => $$invalidate(9, $yScale = value));
    	let { gridlines = true } = $$props;
    	let { tickMarks = false } = $$props;
    	let { formatTick = d => d } = $$props;
    	let { ticks = 7 } = $$props;
    	let { xTick = 0 } = $$props;
    	let { yTick = 0 } = $$props;
    	let { dxTick = 0 } = $$props;
    	let { dyTick = -4 } = $$props;
    	let { textAnchor = "start" } = $$props;

    	const writable_props = [
    		"gridlines",
    		"tickMarks",
    		"formatTick",
    		"ticks",
    		"xTick",
    		"yTick",
    		"dxTick",
    		"dyTick",
    		"textAnchor"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<AxisY> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("gridlines" in $$props) $$invalidate(0, gridlines = $$props.gridlines);
    		if ("tickMarks" in $$props) $$invalidate(1, tickMarks = $$props.tickMarks);
    		if ("formatTick" in $$props) $$invalidate(2, formatTick = $$props.formatTick);
    		if ("ticks" in $$props) $$invalidate(16, ticks = $$props.ticks);
    		if ("xTick" in $$props) $$invalidate(3, xTick = $$props.xTick);
    		if ("yTick" in $$props) $$invalidate(4, yTick = $$props.yTick);
    		if ("dxTick" in $$props) $$invalidate(5, dxTick = $$props.dxTick);
    		if ("dyTick" in $$props) $$invalidate(6, dyTick = $$props.dyTick);
    		if ("textAnchor" in $$props) $$invalidate(7, textAnchor = $$props.textAnchor);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		padding,
    		xRange,
    		yScale,
    		gridlines,
    		tickMarks,
    		formatTick,
    		ticks,
    		xTick,
    		yTick,
    		dxTick,
    		dyTick,
    		textAnchor,
    		isBandwidth,
    		$yScale,
    		tickVals,
    		$padding,
    		$xRange
    	});

    	$$self.$inject_state = $$props => {
    		if ("gridlines" in $$props) $$invalidate(0, gridlines = $$props.gridlines);
    		if ("tickMarks" in $$props) $$invalidate(1, tickMarks = $$props.tickMarks);
    		if ("formatTick" in $$props) $$invalidate(2, formatTick = $$props.formatTick);
    		if ("ticks" in $$props) $$invalidate(16, ticks = $$props.ticks);
    		if ("xTick" in $$props) $$invalidate(3, xTick = $$props.xTick);
    		if ("yTick" in $$props) $$invalidate(4, yTick = $$props.yTick);
    		if ("dxTick" in $$props) $$invalidate(5, dxTick = $$props.dxTick);
    		if ("dyTick" in $$props) $$invalidate(6, dyTick = $$props.dyTick);
    		if ("textAnchor" in $$props) $$invalidate(7, textAnchor = $$props.textAnchor);
    		if ("isBandwidth" in $$props) $$invalidate(8, isBandwidth = $$props.isBandwidth);
    		if ("tickVals" in $$props) $$invalidate(10, tickVals = $$props.tickVals);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$yScale*/ 512) {
    			// console.log("yes!")
    			$$invalidate(8, isBandwidth = typeof $yScale.bandwidth === "function");
    		}

    		if ($$self.$$.dirty & /*ticks, isBandwidth, $yScale*/ 66304) {
    			$$invalidate(10, tickVals = Array.isArray(ticks)
    			? ticks
    			: isBandwidth
    				? $yScale.domain()
    				: typeof ticks === "function"
    					? ticks($yScale.ticks())
    					: $yScale.ticks(ticks));
    		}
    	};

    	return [
    		gridlines,
    		tickMarks,
    		formatTick,
    		xTick,
    		yTick,
    		dxTick,
    		dyTick,
    		textAnchor,
    		isBandwidth,
    		$yScale,
    		tickVals,
    		$padding,
    		$xRange,
    		padding,
    		xRange,
    		yScale,
    		ticks
    	];
    }

    class AxisY extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {
    			gridlines: 0,
    			tickMarks: 1,
    			formatTick: 2,
    			ticks: 16,
    			xTick: 3,
    			yTick: 4,
    			dxTick: 5,
    			dyTick: 6,
    			textAnchor: 7
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AxisY",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get gridlines() {
    		throw new Error("<AxisY>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set gridlines(value) {
    		throw new Error("<AxisY>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tickMarks() {
    		throw new Error("<AxisY>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tickMarks(value) {
    		throw new Error("<AxisY>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get formatTick() {
    		throw new Error("<AxisY>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set formatTick(value) {
    		throw new Error("<AxisY>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ticks() {
    		throw new Error("<AxisY>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ticks(value) {
    		throw new Error("<AxisY>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get xTick() {
    		throw new Error("<AxisY>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set xTick(value) {
    		throw new Error("<AxisY>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get yTick() {
    		throw new Error("<AxisY>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set yTick(value) {
    		throw new Error("<AxisY>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dxTick() {
    		throw new Error("<AxisY>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dxTick(value) {
    		throw new Error("<AxisY>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dyTick() {
    		throw new Error("<AxisY>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dyTick(value) {
    		throw new Error("<AxisY>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get textAnchor() {
    		throw new Error("<AxisY>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set textAnchor(value) {
    		throw new Error("<AxisY>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/GroupLabels.html.svelte generated by Svelte v3.32.2 */
    const file$6 = "src/components/GroupLabels.html.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[19] = list[i];
    	return child_ctx;
    }

    // (22:0) {#each $data as group}
    function create_each_block$3(ctx) {
    	let div;
    	let t_value = /*cap*/ ctx[12](/*$z*/ ctx[3](/*group*/ ctx[19])) + "";
    	let t;
    	let div_class_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", div_class_value = "label  label-" + /*group*/ ctx[19]["name"].substring(0, 5) + " svelte-ypajfm");
    			set_style(div, "top", /*top*/ ctx[1](/*group*/ ctx[19].values) * 100 + "%");
    			set_style(div, "left", /*left*/ ctx[0](/*group*/ ctx[19].values) * 100 + "%");
    			set_style(div, "width", "25%");
    			add_location(div, file$6, 22, 2, 1002);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$z, $data*/ 12 && t_value !== (t_value = /*cap*/ ctx[12](/*$z*/ ctx[3](/*group*/ ctx[19])) + "")) set_data_dev(t, t_value);

    			if (dirty & /*$data*/ 4 && div_class_value !== (div_class_value = "label  label-" + /*group*/ ctx[19]["name"].substring(0, 5) + " svelte-ypajfm")) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (dirty & /*top, $data*/ 6) {
    				set_style(div, "top", /*top*/ ctx[1](/*group*/ ctx[19].values) * 100 + "%");
    			}

    			if (dirty & /*left, $data*/ 5) {
    				set_style(div, "left", /*left*/ ctx[0](/*group*/ ctx[19].values) * 100 + "%");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(22:0) {#each $data as group}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let each_1_anchor;
    	let each_value = /*$data*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$data, top, left, cap, $z*/ 4111) {
    				each_value = /*$data*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let left;
    	let top;
    	let $xScale;
    	let $x;
    	let $xRange;
    	let $yScale;
    	let $y;
    	let $yRange;
    	let $data;
    	let $z;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("GroupLabels_html", slots, []);
    	const { data, x, y, xScale, yScale, xRange, yRange, z } = getContext("LayerCake");
    	validate_store(data, "data");
    	component_subscribe($$self, data, value => $$invalidate(2, $data = value));
    	validate_store(x, "x");
    	component_subscribe($$self, x, value => $$invalidate(14, $x = value));
    	validate_store(y, "y");
    	component_subscribe($$self, y, value => $$invalidate(17, $y = value));
    	validate_store(xScale, "xScale");
    	component_subscribe($$self, xScale, value => $$invalidate(13, $xScale = value));
    	validate_store(yScale, "yScale");
    	component_subscribe($$self, yScale, value => $$invalidate(16, $yScale = value));
    	validate_store(xRange, "xRange");
    	component_subscribe($$self, xRange, value => $$invalidate(15, $xRange = value));
    	validate_store(yRange, "yRange");
    	component_subscribe($$self, yRange, value => $$invalidate(18, $yRange = value));
    	validate_store(z, "z");
    	component_subscribe($$self, z, value => $$invalidate(3, $z = value));

    	/* --------------------------------------------
     * Title case the first letter
     */
    	const cap = val => val.replace(/^\w/, d => d.toUpperCase());

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<GroupLabels_html> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		getContext,
    		max,
    		data,
    		x,
    		y,
    		xScale,
    		yScale,
    		xRange,
    		yRange,
    		z,
    		cap,
    		left,
    		$xScale,
    		$x,
    		$xRange,
    		top,
    		$yScale,
    		$y,
    		$yRange,
    		$data,
    		$z
    	});

    	$$self.$inject_state = $$props => {
    		if ("left" in $$props) $$invalidate(0, left = $$props.left);
    		if ("top" in $$props) $$invalidate(1, top = $$props.top);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$xScale, $x, $xRange*/ 57344) {
    			/* --------------------------------------------
     * Put the label on the highest value
     */
    			$$invalidate(0, left = values => $xScale(max(values, $x)) / Math.max(...$xRange) * 0.98);
    		}

    		if ($$self.$$.dirty & /*$yScale, $y, $yRange*/ 458752) {
    			$$invalidate(1, top = values => $yScale(max(values, $y)) / Math.max(...$yRange) * 6);
    		}
    	};

    	return [
    		left,
    		top,
    		$data,
    		$z,
    		data,
    		x,
    		y,
    		xScale,
    		yScale,
    		xRange,
    		yRange,
    		z,
    		cap,
    		$xScale,
    		$x,
    		$xRange,
    		$yScale,
    		$y,
    		$yRange
    	];
    }

    class GroupLabels_html extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "GroupLabels_html",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    function tree_add(d) {
      var x = +this._x.call(null, d),
          y = +this._y.call(null, d);
      return add(this.cover(x, y), x, y, d);
    }

    function add(tree, x, y, d) {
      if (isNaN(x) || isNaN(y)) return tree; // ignore invalid points

      var parent,
          node = tree._root,
          leaf = {data: d},
          x0 = tree._x0,
          y0 = tree._y0,
          x1 = tree._x1,
          y1 = tree._y1,
          xm,
          ym,
          xp,
          yp,
          right,
          bottom,
          i,
          j;

      // If the tree is empty, initialize the root as a leaf.
      if (!node) return tree._root = leaf, tree;

      // Find the existing leaf for the new point, or add it.
      while (node.length) {
        if (right = x >= (xm = (x0 + x1) / 2)) x0 = xm; else x1 = xm;
        if (bottom = y >= (ym = (y0 + y1) / 2)) y0 = ym; else y1 = ym;
        if (parent = node, !(node = node[i = bottom << 1 | right])) return parent[i] = leaf, tree;
      }

      // Is the new point is exactly coincident with the existing point?
      xp = +tree._x.call(null, node.data);
      yp = +tree._y.call(null, node.data);
      if (x === xp && y === yp) return leaf.next = node, parent ? parent[i] = leaf : tree._root = leaf, tree;

      // Otherwise, split the leaf node until the old and new point are separated.
      do {
        parent = parent ? parent[i] = new Array(4) : tree._root = new Array(4);
        if (right = x >= (xm = (x0 + x1) / 2)) x0 = xm; else x1 = xm;
        if (bottom = y >= (ym = (y0 + y1) / 2)) y0 = ym; else y1 = ym;
      } while ((i = bottom << 1 | right) === (j = (yp >= ym) << 1 | (xp >= xm)));
      return parent[j] = node, parent[i] = leaf, tree;
    }

    function addAll(data) {
      var d, i, n = data.length,
          x,
          y,
          xz = new Array(n),
          yz = new Array(n),
          x0 = Infinity,
          y0 = Infinity,
          x1 = -Infinity,
          y1 = -Infinity;

      // Compute the points and their extent.
      for (i = 0; i < n; ++i) {
        if (isNaN(x = +this._x.call(null, d = data[i])) || isNaN(y = +this._y.call(null, d))) continue;
        xz[i] = x;
        yz[i] = y;
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }

      // If there were no (valid) points, abort.
      if (x0 > x1 || y0 > y1) return this;

      // Expand the tree to cover the new points.
      this.cover(x0, y0).cover(x1, y1);

      // Add the new points.
      for (i = 0; i < n; ++i) {
        add(this, xz[i], yz[i], data[i]);
      }

      return this;
    }

    function tree_cover(x, y) {
      if (isNaN(x = +x) || isNaN(y = +y)) return this; // ignore invalid points

      var x0 = this._x0,
          y0 = this._y0,
          x1 = this._x1,
          y1 = this._y1;

      // If the quadtree has no extent, initialize them.
      // Integer extent are necessary so that if we later double the extent,
      // the existing quadrant boundaries don’t change due to floating point error!
      if (isNaN(x0)) {
        x1 = (x0 = Math.floor(x)) + 1;
        y1 = (y0 = Math.floor(y)) + 1;
      }

      // Otherwise, double repeatedly to cover.
      else {
        var z = x1 - x0,
            node = this._root,
            parent,
            i;

        while (x0 > x || x >= x1 || y0 > y || y >= y1) {
          i = (y < y0) << 1 | (x < x0);
          parent = new Array(4), parent[i] = node, node = parent, z *= 2;
          switch (i) {
            case 0: x1 = x0 + z, y1 = y0 + z; break;
            case 1: x0 = x1 - z, y1 = y0 + z; break;
            case 2: x1 = x0 + z, y0 = y1 - z; break;
            case 3: x0 = x1 - z, y0 = y1 - z; break;
          }
        }

        if (this._root && this._root.length) this._root = node;
      }

      this._x0 = x0;
      this._y0 = y0;
      this._x1 = x1;
      this._y1 = y1;
      return this;
    }

    function tree_data() {
      var data = [];
      this.visit(function(node) {
        if (!node.length) do data.push(node.data); while (node = node.next)
      });
      return data;
    }

    function tree_extent(_) {
      return arguments.length
          ? this.cover(+_[0][0], +_[0][1]).cover(+_[1][0], +_[1][1])
          : isNaN(this._x0) ? undefined : [[this._x0, this._y0], [this._x1, this._y1]];
    }

    function Quad(node, x0, y0, x1, y1) {
      this.node = node;
      this.x0 = x0;
      this.y0 = y0;
      this.x1 = x1;
      this.y1 = y1;
    }

    function tree_find(x, y, radius) {
      var data,
          x0 = this._x0,
          y0 = this._y0,
          x1,
          y1,
          x2,
          y2,
          x3 = this._x1,
          y3 = this._y1,
          quads = [],
          node = this._root,
          q,
          i;

      if (node) quads.push(new Quad(node, x0, y0, x3, y3));
      if (radius == null) radius = Infinity;
      else {
        x0 = x - radius, y0 = y - radius;
        x3 = x + radius, y3 = y + radius;
        radius *= radius;
      }

      while (q = quads.pop()) {

        // Stop searching if this quadrant can’t contain a closer node.
        if (!(node = q.node)
            || (x1 = q.x0) > x3
            || (y1 = q.y0) > y3
            || (x2 = q.x1) < x0
            || (y2 = q.y1) < y0) continue;

        // Bisect the current quadrant.
        if (node.length) {
          var xm = (x1 + x2) / 2,
              ym = (y1 + y2) / 2;

          quads.push(
            new Quad(node[3], xm, ym, x2, y2),
            new Quad(node[2], x1, ym, xm, y2),
            new Quad(node[1], xm, y1, x2, ym),
            new Quad(node[0], x1, y1, xm, ym)
          );

          // Visit the closest quadrant first.
          if (i = (y >= ym) << 1 | (x >= xm)) {
            q = quads[quads.length - 1];
            quads[quads.length - 1] = quads[quads.length - 1 - i];
            quads[quads.length - 1 - i] = q;
          }
        }

        // Visit this point. (Visiting coincident points isn’t necessary!)
        else {
          var dx = x - +this._x.call(null, node.data),
              dy = y - +this._y.call(null, node.data),
              d2 = dx * dx + dy * dy;
          if (d2 < radius) {
            var d = Math.sqrt(radius = d2);
            x0 = x - d, y0 = y - d;
            x3 = x + d, y3 = y + d;
            data = node.data;
          }
        }
      }

      return data;
    }

    function tree_remove(d) {
      if (isNaN(x = +this._x.call(null, d)) || isNaN(y = +this._y.call(null, d))) return this; // ignore invalid points

      var parent,
          node = this._root,
          retainer,
          previous,
          next,
          x0 = this._x0,
          y0 = this._y0,
          x1 = this._x1,
          y1 = this._y1,
          x,
          y,
          xm,
          ym,
          right,
          bottom,
          i,
          j;

      // If the tree is empty, initialize the root as a leaf.
      if (!node) return this;

      // Find the leaf node for the point.
      // While descending, also retain the deepest parent with a non-removed sibling.
      if (node.length) while (true) {
        if (right = x >= (xm = (x0 + x1) / 2)) x0 = xm; else x1 = xm;
        if (bottom = y >= (ym = (y0 + y1) / 2)) y0 = ym; else y1 = ym;
        if (!(parent = node, node = node[i = bottom << 1 | right])) return this;
        if (!node.length) break;
        if (parent[(i + 1) & 3] || parent[(i + 2) & 3] || parent[(i + 3) & 3]) retainer = parent, j = i;
      }

      // Find the point to remove.
      while (node.data !== d) if (!(previous = node, node = node.next)) return this;
      if (next = node.next) delete node.next;

      // If there are multiple coincident points, remove just the point.
      if (previous) return (next ? previous.next = next : delete previous.next), this;

      // If this is the root point, remove it.
      if (!parent) return this._root = next, this;

      // Remove this leaf.
      next ? parent[i] = next : delete parent[i];

      // If the parent now contains exactly one leaf, collapse superfluous parents.
      if ((node = parent[0] || parent[1] || parent[2] || parent[3])
          && node === (parent[3] || parent[2] || parent[1] || parent[0])
          && !node.length) {
        if (retainer) retainer[j] = node;
        else this._root = node;
      }

      return this;
    }

    function removeAll(data) {
      for (var i = 0, n = data.length; i < n; ++i) this.remove(data[i]);
      return this;
    }

    function tree_root() {
      return this._root;
    }

    function tree_size() {
      var size = 0;
      this.visit(function(node) {
        if (!node.length) do ++size; while (node = node.next)
      });
      return size;
    }

    function tree_visit(callback) {
      var quads = [], q, node = this._root, child, x0, y0, x1, y1;
      if (node) quads.push(new Quad(node, this._x0, this._y0, this._x1, this._y1));
      while (q = quads.pop()) {
        if (!callback(node = q.node, x0 = q.x0, y0 = q.y0, x1 = q.x1, y1 = q.y1) && node.length) {
          var xm = (x0 + x1) / 2, ym = (y0 + y1) / 2;
          if (child = node[3]) quads.push(new Quad(child, xm, ym, x1, y1));
          if (child = node[2]) quads.push(new Quad(child, x0, ym, xm, y1));
          if (child = node[1]) quads.push(new Quad(child, xm, y0, x1, ym));
          if (child = node[0]) quads.push(new Quad(child, x0, y0, xm, ym));
        }
      }
      return this;
    }

    function tree_visitAfter(callback) {
      var quads = [], next = [], q;
      if (this._root) quads.push(new Quad(this._root, this._x0, this._y0, this._x1, this._y1));
      while (q = quads.pop()) {
        var node = q.node;
        if (node.length) {
          var child, x0 = q.x0, y0 = q.y0, x1 = q.x1, y1 = q.y1, xm = (x0 + x1) / 2, ym = (y0 + y1) / 2;
          if (child = node[0]) quads.push(new Quad(child, x0, y0, xm, ym));
          if (child = node[1]) quads.push(new Quad(child, xm, y0, x1, ym));
          if (child = node[2]) quads.push(new Quad(child, x0, ym, xm, y1));
          if (child = node[3]) quads.push(new Quad(child, xm, ym, x1, y1));
        }
        next.push(q);
      }
      while (q = next.pop()) {
        callback(q.node, q.x0, q.y0, q.x1, q.y1);
      }
      return this;
    }

    function defaultX(d) {
      return d[0];
    }

    function tree_x(_) {
      return arguments.length ? (this._x = _, this) : this._x;
    }

    function defaultY(d) {
      return d[1];
    }

    function tree_y(_) {
      return arguments.length ? (this._y = _, this) : this._y;
    }

    function quadtree(nodes, x, y) {
      var tree = new Quadtree(x == null ? defaultX : x, y == null ? defaultY : y, NaN, NaN, NaN, NaN);
      return nodes == null ? tree : tree.addAll(nodes);
    }

    function Quadtree(x, y, x0, y0, x1, y1) {
      this._x = x;
      this._y = y;
      this._x0 = x0;
      this._y0 = y0;
      this._x1 = x1;
      this._y1 = y1;
      this._root = undefined;
    }

    function leaf_copy(leaf) {
      var copy = {data: leaf.data}, next = copy;
      while (leaf = leaf.next) next = next.next = {data: leaf.data};
      return copy;
    }

    var treeProto = quadtree.prototype = Quadtree.prototype;

    treeProto.copy = function() {
      var copy = new Quadtree(this._x, this._y, this._x0, this._y0, this._x1, this._y1),
          node = this._root,
          nodes,
          child;

      if (!node) return copy;

      if (!node.length) return copy._root = leaf_copy(node), copy;

      nodes = [{source: node, target: copy._root = new Array(4)}];
      while (node = nodes.pop()) {
        for (var i = 0; i < 4; ++i) {
          if (child = node.source[i]) {
            if (child.length) nodes.push({source: child, target: node.target[i] = new Array(4)});
            else node.target[i] = leaf_copy(child);
          }
        }
      }

      return copy;
    };

    treeProto.add = tree_add;
    treeProto.addAll = addAll;
    treeProto.cover = tree_cover;
    treeProto.data = tree_data;
    treeProto.extent = tree_extent;
    treeProto.find = tree_find;
    treeProto.remove = tree_remove;
    treeProto.removeAll = removeAll;
    treeProto.root = tree_root;
    treeProto.size = tree_size;
    treeProto.visit = tree_visit;
    treeProto.visitAfter = tree_visitAfter;
    treeProto.x = tree_x;
    treeProto.y = tree_y;

    /* src/components/QuadTree.html.svelte generated by Svelte v3.32.2 */

    const { Object: Object_1$1 } = globals;
    const file$7 = "src/components/QuadTree.html.svelte";

    const get_default_slot_changes$3 = dirty => ({
    	x: dirty & /*xGetter, found*/ 9,
    	y: dirty & /*yGetter, found*/ 10,
    	found: dirty & /*found*/ 8,
    	visible: dirty & /*visible*/ 4,
    	e: dirty & /*e*/ 16
    });

    const get_default_slot_context$3 = ctx => ({
    	x: /*xGetter*/ ctx[0](/*found*/ ctx[3]) || 0,
    	y: /*yGetter*/ ctx[1](/*found*/ ctx[3]) || 0,
    	found: /*found*/ ctx[3],
    	visible: /*visible*/ ctx[2],
    	e: /*e*/ ctx[4]
    });

    function create_fragment$7(ctx) {
    	let div;
    	let t;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[21].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[20], get_default_slot_context$3);

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = space();
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "bg svelte-1kz3ofa");
    			add_location(div, file$7, 56, 0, 2330);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			insert_dev(target, t, anchor);

    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div, "mousemove", /*findItem*/ ctx[10], false, false, false),
    					listen_dev(div, "mouseout", /*mouseout_handler*/ ctx[22], false, false, false),
    					listen_dev(div, "blur", /*blur_handler*/ ctx[23], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope, xGetter, found, yGetter, visible, e*/ 1048607) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[20], dirty, get_default_slot_changes$3, get_default_slot_context$3);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let xGetter;
    	let yGetter;
    	let finder;
    	let $xGet;
    	let $yGet;
    	let $width;
    	let $height;
    	let $data;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("QuadTree_html", slots, ['default']);
    	const { data, xGet, yGet, width, height } = getContext("LayerCake");
    	validate_store(data, "data");
    	component_subscribe($$self, data, value => $$invalidate(19, $data = value));
    	validate_store(xGet, "xGet");
    	component_subscribe($$self, xGet, value => $$invalidate(15, $xGet = value));
    	validate_store(yGet, "yGet");
    	component_subscribe($$self, yGet, value => $$invalidate(16, $yGet = value));
    	validate_store(width, "width");
    	component_subscribe($$self, width, value => $$invalidate(17, $width = value));
    	validate_store(height, "height");
    	component_subscribe($$self, height, value => $$invalidate(18, $height = value));
    	let visible = false;
    	let found = {};
    	let e = {};
    	let { dataset = undefined } = $$props;
    	let { x = "x" } = $$props;
    	let { y = "y" } = $$props;
    	let { searchRadius = undefined } = $$props;

    	function findItem(evt) {
    		$$invalidate(4, e = evt);
    		const xLayerKey = `layer${x.toUpperCase()}`;
    		const yLayerKey = `layer${y.toUpperCase()}`;

    		// console.log('evt', evt[xLayerKey], evt[yLayerKey]);
    		$$invalidate(3, found = finder.find(evt[xLayerKey], evt[yLayerKey], searchRadius) || {});

    		$$invalidate(2, visible = Object.keys(found).length > 0);
    	}

    	const writable_props = ["dataset", "x", "y", "searchRadius"];

    	Object_1$1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<QuadTree_html> was created with unknown prop '${key}'`);
    	});

    	const mouseout_handler = () => $$invalidate(2, visible = false);
    	const blur_handler = () => $$invalidate(2, visible = false);

    	$$self.$$set = $$props => {
    		if ("dataset" in $$props) $$invalidate(11, dataset = $$props.dataset);
    		if ("x" in $$props) $$invalidate(12, x = $$props.x);
    		if ("y" in $$props) $$invalidate(13, y = $$props.y);
    		if ("searchRadius" in $$props) $$invalidate(14, searchRadius = $$props.searchRadius);
    		if ("$$scope" in $$props) $$invalidate(20, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		quadtree,
    		data,
    		xGet,
    		yGet,
    		width,
    		height,
    		visible,
    		found,
    		e,
    		dataset,
    		x,
    		y,
    		searchRadius,
    		findItem,
    		xGetter,
    		$xGet,
    		$yGet,
    		yGetter,
    		finder,
    		$width,
    		$height,
    		$data
    	});

    	$$self.$inject_state = $$props => {
    		if ("visible" in $$props) $$invalidate(2, visible = $$props.visible);
    		if ("found" in $$props) $$invalidate(3, found = $$props.found);
    		if ("e" in $$props) $$invalidate(4, e = $$props.e);
    		if ("dataset" in $$props) $$invalidate(11, dataset = $$props.dataset);
    		if ("x" in $$props) $$invalidate(12, x = $$props.x);
    		if ("y" in $$props) $$invalidate(13, y = $$props.y);
    		if ("searchRadius" in $$props) $$invalidate(14, searchRadius = $$props.searchRadius);
    		if ("xGetter" in $$props) $$invalidate(0, xGetter = $$props.xGetter);
    		if ("yGetter" in $$props) $$invalidate(1, yGetter = $$props.yGetter);
    		if ("finder" in $$props) finder = $$props.finder;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*x, $xGet, $yGet*/ 102400) {
    			$$invalidate(0, xGetter = x === "x" ? $xGet : $yGet);
    		}

    		if ($$self.$$.dirty & /*y, $yGet, $xGet*/ 106496) {
    			$$invalidate(1, yGetter = y === "y" ? $yGet : $xGet);
    		}

    		if ($$self.$$.dirty & /*$width, $height, xGetter, yGetter, dataset, $data*/ 919555) {
    			finder = quadtree().extent([[-1, -1], [$width + 1, $height + 1]]).x(xGetter).y(yGetter).addAll(dataset || $data);
    		}
    	};

    	return [
    		xGetter,
    		yGetter,
    		visible,
    		found,
    		e,
    		data,
    		xGet,
    		yGet,
    		width,
    		height,
    		findItem,
    		dataset,
    		x,
    		y,
    		searchRadius,
    		$xGet,
    		$yGet,
    		$width,
    		$height,
    		$data,
    		$$scope,
    		slots,
    		mouseout_handler,
    		blur_handler
    	];
    }

    class QuadTree_html extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {
    			dataset: 11,
    			x: 12,
    			y: 13,
    			searchRadius: 14
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "QuadTree_html",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get dataset() {
    		throw new Error("<QuadTree_html>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dataset(value) {
    		throw new Error("<QuadTree_html>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get x() {
    		throw new Error("<QuadTree_html>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set x(value) {
    		throw new Error("<QuadTree_html>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get y() {
    		throw new Error("<QuadTree_html>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set y(value) {
    		throw new Error("<QuadTree_html>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get searchRadius() {
    		throw new Error("<QuadTree_html>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set searchRadius(value) {
    		throw new Error("<QuadTree_html>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/SharedTooltip.html.svelte generated by Svelte v3.32.2 */

    const { Object: Object_1$2 } = globals;
    const file$8 = "src/components/SharedTooltip.html.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[22] = list[i];
    	return child_ctx;
    }

    // (89:2) {#if visible === true}
    function create_if_block$3(ctx) {
    	let div0;
    	let t0;
    	let div2;
    	let div1;
    	let t1_value = /*formatTitle*/ ctx[2](/*found*/ ctx[20][/*$config*/ ctx[5].x]) + "";
    	let t1;
    	let t2;
    	let each_value = /*sortResult*/ ctx[13](/*found*/ ctx[20]);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = space();
    			div2 = element("div");
    			div1 = element("div");
    			t1 = text(t1_value);
    			t2 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			set_style(div0, "left", /*x*/ ctx[17] + "px");
    			attr_dev(div0, "class", "line svelte-1bu0h2n");
    			add_location(div0, file$8, 89, 4, 2552);
    			attr_dev(div1, "class", "title svelte-1bu0h2n");
    			add_location(div1, file$8, 100, 8, 2860);
    			attr_dev(div2, "class", "tooltip svelte-1bu0h2n");
    			set_style(div2, "width", w + "px");
    			set_style(div2, "display", /*visible*/ ctx[19] ? "block" : "none");
    			set_style(div2, "top", /*$yScale*/ ctx[6](/*sortResult*/ ctx[13](/*found*/ ctx[20])[0].value) - /*offset*/ ctx[0] + "px");
    			set_style(div2, "left", Math.min(Math.max(/*w2*/ ctx[12], /*x*/ ctx[17]), /*$width*/ ctx[7] - /*w2*/ ctx[12]) + "px");
    			add_location(div2, file$8, 92, 4, 2613);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, t1);
    			append_dev(div2, t2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div2, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*x*/ 131072) {
    				set_style(div0, "left", /*x*/ ctx[17] + "px");
    			}

    			if (dirty & /*formatTitle, found, $config*/ 1048612 && t1_value !== (t1_value = /*formatTitle*/ ctx[2](/*found*/ ctx[20][/*$config*/ ctx[5].x]) + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*formatValue, sortResult, found, formatKey*/ 1056792) {
    				each_value = /*sortResult*/ ctx[13](/*found*/ ctx[20]);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div2, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*visible*/ 524288) {
    				set_style(div2, "display", /*visible*/ ctx[19] ? "block" : "none");
    			}

    			if (dirty & /*$yScale, found, offset*/ 1048641) {
    				set_style(div2, "top", /*$yScale*/ ctx[6](/*sortResult*/ ctx[13](/*found*/ ctx[20])[0].value) - /*offset*/ ctx[0] + "px");
    			}

    			if (dirty & /*x, $width*/ 131200) {
    				set_style(div2, "left", Math.min(Math.max(/*w2*/ ctx[12], /*x*/ ctx[17]), /*$width*/ ctx[7] - /*w2*/ ctx[12]) + "px");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div2);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(89:2) {#if visible === true}",
    		ctx
    	});

    	return block;
    }

    // (102:8) {#each sortResult(found) as row}
    function create_each_block$4(ctx) {
    	let div;
    	let span;
    	let t0_value = /*formatKey*/ ctx[3](/*row*/ ctx[22].key) + "";
    	let t0;
    	let t1;
    	let t2;
    	let t3_value = /*formatValue*/ ctx[4](/*row*/ ctx[22].value) + "";
    	let t3;

    	const block = {
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = text(":");
    			t2 = space();
    			t3 = text(t3_value);
    			attr_dev(span, "class", "key svelte-1bu0h2n");
    			add_location(span, file$8, 102, 27, 2985);
    			attr_dev(div, "class", "row");
    			add_location(div, file$8, 102, 10, 2968);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span);
    			append_dev(span, t0);
    			append_dev(span, t1);
    			append_dev(div, t2);
    			append_dev(div, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*formatKey, found*/ 1048584 && t0_value !== (t0_value = /*formatKey*/ ctx[3](/*row*/ ctx[22].key) + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*formatValue, found*/ 1048592 && t3_value !== (t3_value = /*formatValue*/ ctx[4](/*row*/ ctx[22].value) + "")) set_data_dev(t3, t3_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(102:8) {#each sortResult(found) as row}",
    		ctx
    	});

    	return block;
    }

    // (80:0) <QuadTree   dataset={dataset}   y='x'   let:x   let:y   let:visible   let:found   let:e >
    function create_default_slot(ctx) {
    	let if_block_anchor;
    	let if_block = /*visible*/ ctx[19] === true && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*visible*/ ctx[19] === true) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(80:0) <QuadTree   dataset={dataset}   y='x'   let:x   let:y   let:visible   let:found   let:e >",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let quadtree;
    	let current;

    	quadtree = new QuadTree_html({
    			props: {
    				dataset: /*dataset*/ ctx[1],
    				y: "x",
    				$$slots: {
    					default: [
    						create_default_slot,
    						({ x, y, visible, found, e }) => ({
    							17: x,
    							18: y,
    							19: visible,
    							20: found,
    							21: e
    						}),
    						({ x, y, visible, found, e }) => (x ? 131072 : 0) | (y ? 262144 : 0) | (visible ? 524288 : 0) | (found ? 1048576 : 0) | (e ? 2097152 : 0)
    					]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(quadtree.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(quadtree, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const quadtree_changes = {};
    			if (dirty & /*dataset*/ 2) quadtree_changes.dataset = /*dataset*/ ctx[1];

    			if (dirty & /*$$scope, visible, $yScale, found, offset, x, $width, formatValue, formatKey, formatTitle, $config*/ 35258621) {
    				quadtree_changes.$$scope = { dirty, ctx };
    			}

    			quadtree.$set(quadtree_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(quadtree.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(quadtree.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(quadtree, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const w = 150;

    function instance$8($$self, $$props, $$invalidate) {
    	let $data;
    	let $config;
    	let $yScale;
    	let $width;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("SharedTooltip_html", slots, []);
    	const { data, width, yScale, config } = getContext("LayerCake");
    	validate_store(data, "data");
    	component_subscribe($$self, data, value => $$invalidate(14, $data = value));
    	validate_store(width, "width");
    	component_subscribe($$self, width, value => $$invalidate(7, $width = value));
    	validate_store(yScale, "yScale");
    	component_subscribe($$self, yScale, value => $$invalidate(6, $yScale = value));
    	validate_store(config, "config");
    	component_subscribe($$self, config, value => $$invalidate(5, $config = value));
    	const commas = format(",");
    	const titleCase = d => d.replace(/^\w/, w => w.toUpperCase());
    	let { offset = 20 } = $$props;
    	let { dataset = $data } = $$props;
    	let { formatTitle = d => d } = $$props;
    	let { formatKey = d => titleCase(d) } = $$props;
    	let { formatValue = d => isNaN(+d) ? d : commas(d) } = $$props;
    	const w2 = w / 2;

    	/* --------------------------------------------
     * Sort the keys by the highest value
     */
    	function sortResult(result) {
    		if (Object.keys(result).length === 0) return [];

    		const rows = Object.keys(result).filter(d => d !== $config.x).map(key => {
    			return { key, value: result[key] };
    		}).sort((a, b) => b.value - a.value);

    		// console.log(result)
    		return rows;
    	}

    	const writable_props = ["offset", "dataset", "formatTitle", "formatKey", "formatValue"];

    	Object_1$2.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SharedTooltip_html> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("offset" in $$props) $$invalidate(0, offset = $$props.offset);
    		if ("dataset" in $$props) $$invalidate(1, dataset = $$props.dataset);
    		if ("formatTitle" in $$props) $$invalidate(2, formatTitle = $$props.formatTitle);
    		if ("formatKey" in $$props) $$invalidate(3, formatKey = $$props.formatKey);
    		if ("formatValue" in $$props) $$invalidate(4, formatValue = $$props.formatValue);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		format,
    		QuadTree: QuadTree_html,
    		data,
    		width,
    		yScale,
    		config,
    		commas,
    		titleCase,
    		offset,
    		dataset,
    		formatTitle,
    		formatKey,
    		formatValue,
    		w,
    		w2,
    		sortResult,
    		$data,
    		$config,
    		$yScale,
    		$width
    	});

    	$$self.$inject_state = $$props => {
    		if ("offset" in $$props) $$invalidate(0, offset = $$props.offset);
    		if ("dataset" in $$props) $$invalidate(1, dataset = $$props.dataset);
    		if ("formatTitle" in $$props) $$invalidate(2, formatTitle = $$props.formatTitle);
    		if ("formatKey" in $$props) $$invalidate(3, formatKey = $$props.formatKey);
    		if ("formatValue" in $$props) $$invalidate(4, formatValue = $$props.formatValue);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		offset,
    		dataset,
    		formatTitle,
    		formatKey,
    		formatValue,
    		$config,
    		$yScale,
    		$width,
    		data,
    		width,
    		yScale,
    		config,
    		w2,
    		sortResult
    	];
    }

    class SharedTooltip_html extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {
    			offset: 0,
    			dataset: 1,
    			formatTitle: 2,
    			formatKey: 3,
    			formatValue: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SharedTooltip_html",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get offset() {
    		throw new Error("<SharedTooltip_html>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set offset(value) {
    		throw new Error("<SharedTooltip_html>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dataset() {
    		throw new Error("<SharedTooltip_html>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dataset(value) {
    		throw new Error("<SharedTooltip_html>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get formatTitle() {
    		throw new Error("<SharedTooltip_html>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set formatTitle(value) {
    		throw new Error("<SharedTooltip_html>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get formatKey() {
    		throw new Error("<SharedTooltip_html>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set formatKey(value) {
    		throw new Error("<SharedTooltip_html>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get formatValue() {
    		throw new Error("<SharedTooltip_html>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set formatValue(value) {
    		throw new Error("<SharedTooltip_html>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var data = [ { month:"2019-01-01",
        "Caixin China services PMI":"53.6",
        "Official China services PMI":"53.6" },
      { month:"2019-02-01",
        "Caixin China services PMI":"51.1",
        "Official China services PMI":"53.5" },
      { month:"2019-03-01",
        "Caixin China services PMI":"54.4",
        "Official China services PMI":"53.6" },
      { month:"2019-04-01",
        "Caixin China services PMI":"54.5",
        "Official China services PMI":"53.3" },
      { month:"2019-05-01",
        "Caixin China services PMI":"52.7",
        "Official China services PMI":"53.5" },
      { month:"2019-06-01",
        "Caixin China services PMI":"52.0",
        "Official China services PMI":"53.4" },
      { month:"2019-07-01",
        "Caixin China services PMI":"51.6",
        "Official China services PMI":"52.9" },
      { month:"2019-08-01",
        "Caixin China services PMI":"52.1",
        "Official China services PMI":"52.5" },
      { month:"2019-09-01",
        "Caixin China services PMI":"51.3",
        "Official China services PMI":"53.0" },
      { month:"2019-10-01",
        "Caixin China services PMI":"51.1",
        "Official China services PMI":"51.4" },
      { month:"2019-11-01",
        "Caixin China services PMI":"53.5",
        "Official China services PMI":"53.5" },
      { month:"2019-12-01",
        "Caixin China services PMI":"52.5",
        "Official China services PMI":"53.0" },
      { month:"2020-01-01",
        "Caixin China services PMI":"51.8",
        "Official China services PMI":"53.1" },
      { month:"2020-02-01",
        "Caixin China services PMI":"26.5",
        "Official China services PMI":"30.1" },
      { month:"2020-03-01",
        "Caixin China services PMI":"43.0",
        "Official China services PMI":"51.8" },
      { month:"2020-04-01",
        "Caixin China services PMI":"44.4",
        "Official China services PMI":"52.1" },
      { month:"2020-05-01",
        "Caixin China services PMI":"55.0",
        "Official China services PMI":"52.3" },
      { month:"2020-06-01",
        "Caixin China services PMI":"58.4",
        "Official China services PMI":"53.4" },
      { month:"2020-07-01",
        "Caixin China services PMI":"54.1",
        "Official China services PMI":"53.1" },
      { month:"2020-08-01",
        "Caixin China services PMI":"54.0",
        "Official China services PMI":"54.3" },
      { month:"2020-09-01",
        "Caixin China services PMI":"54.8",
        "Official China services PMI":"55.2" },
      { month:"2020-10-01",
        "Caixin China services PMI":"56.8",
        "Official China services PMI":"55.5" },
      { month:"2020-11-01",
        "Caixin China services PMI":"57.8",
        "Official China services PMI":"55.7" },
      { month:"2020-12-01",
        "Caixin China services PMI":"56.3",
        "Official China services PMI":"54.8" },
      { month:"2021-01-01",
        "Caixin China services PMI":"52.0",
        "Official China services PMI":"51.1" },
      { month:"2021-02-01",
        "Caixin China services PMI":"51.5",
        "Official China services PMI":"50.8" },
      { month:"2021-03-01",
        "Caixin China services PMI":"54.3",
        "Official China services PMI":"55.2" },
      { month:"2021-04-01",
        "Caixin China services PMI":"56.3",
        "Official China services PMI":"54.4" },
      { month:"2021-05-01",
        "Caixin China services PMI":"55.1",
        "Official China services PMI":"54.3" },
      { month:"2021-06-01",
        "Caixin China services PMI":"50.3",
        "Official China services PMI":"52.3" },
      { month:"2021-07-01",
        "Caixin China services PMI":"54.9",
        "Official China services PMI":"52.5" },
      { month:"2021-08-01",
        "Caixin China services PMI":"46.7",
        "Official China services PMI":"45.2" },
      { month:"2021-09-01",
        "Caixin China services PMI":"53.4",
        "Official China services PMI":"52.4" },
      { month:"2021-10-01",
        "Caixin China services PMI":"53.8",
        "Official China services PMI":"51.6" } ];

    /* src/App.svelte generated by Svelte v3.32.2 */

    const { Object: Object_1$3, console: console_1$1 } = globals;

    const file$9 = "src/App.svelte";

    // (97:4) <Svg>
    function create_default_slot_2(ctx) {
    	let axisx;
    	let t0;
    	let axisy;
    	let t1;
    	let multiline;
    	let current;

    	axisx = new AxisX({
    			props: {
    				gridlines: false,
    				ticks: data.map(/*func*/ ctx[6]).sort(func_1),
    				formatTick: /*formatTickX*/ ctx[4],
    				snapTicks: true,
    				tickMarks: true
    			},
    			$$inline: true
    		});

    	axisy = new AxisY({
    			props: {
    				ticks: 7,
    				formatTick: /*formatTickY*/ ctx[5]
    			},
    			$$inline: true
    		});

    	multiline = new MultiLine({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(axisx.$$.fragment);
    			t0 = space();
    			create_component(axisy.$$.fragment);
    			t1 = space();
    			create_component(multiline.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(axisx, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(axisy, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(multiline, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(axisx.$$.fragment, local);
    			transition_in(axisy.$$.fragment, local);
    			transition_in(multiline.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(axisx.$$.fragment, local);
    			transition_out(axisy.$$.fragment, local);
    			transition_out(multiline.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(axisx, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(axisy, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(multiline, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(97:4) <Svg>",
    		ctx
    	});

    	return block;
    }

    // (112:4) <Html>
    function create_default_slot_1(ctx) {
    	let labels;
    	let t;
    	let sharedtooltip;
    	let current;
    	labels = new GroupLabels_html({ $$inline: true });

    	sharedtooltip = new SharedTooltip_html({
    			props: {
    				formatTitle: /*formatTickX*/ ctx[4],
    				dataset: data
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(labels.$$.fragment);
    			t = space();
    			create_component(sharedtooltip.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(labels, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(sharedtooltip, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(labels.$$.fragment, local);
    			transition_in(sharedtooltip.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(labels.$$.fragment, local);
    			transition_out(sharedtooltip.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(labels, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(sharedtooltip, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(112:4) <Html>",
    		ctx
    	});

    	return block;
    }

    // (85:2) <LayerCake     padding={{ top: 7, right: 10, bottom: 20, left: 25 }}     x={xKey}     y={yKey}     z={zKey}     yDomain={[0, null]}     zScale={scaleOrdinal()}     zDomain={seriesNames}     zRange={seriesColors}     flatData={flatten(dataLong)}     data={dataLong}   >
    function create_default_slot$1(ctx) {
    	let svg;
    	let t;
    	let html;
    	let current;

    	svg = new Svg({
    			props: {
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	html = new Html({
    			props: {
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(svg.$$.fragment);
    			t = space();
    			create_component(html.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(svg, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(html, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const svg_changes = {};

    			if (dirty & /*$$scope*/ 256) {
    				svg_changes.$$scope = { dirty, ctx };
    			}

    			svg.$set(svg_changes);
    			const html_changes = {};

    			if (dirty & /*$$scope*/ 256) {
    				html_changes.$$scope = { dirty, ctx };
    			}

    			html.$set(html_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(svg.$$.fragment, local);
    			transition_in(html.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(svg.$$.fragment, local);
    			transition_out(html.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(svg, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(html, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(85:2) <LayerCake     padding={{ top: 7, right: 10, bottom: 20, left: 25 }}     x={xKey}     y={yKey}     z={zKey}     yDomain={[0, null]}     zScale={scaleOrdinal()}     zDomain={seriesNames}     zRange={seriesColors}     flatData={flatten(dataLong)}     data={dataLong}   >",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let h2;
    	let t1;
    	let div;
    	let layercake;
    	let current;

    	layercake = new LayerCake({
    			props: {
    				padding: { top: 7, right: 10, bottom: 20, left: 25 },
    				x: xKey,
    				y: yKey,
    				z: zKey,
    				yDomain: [0, null],
    				zScale: ordinal(),
    				zDomain: /*seriesNames*/ ctx[0],
    				zRange: /*seriesColors*/ ctx[1],
    				flatData: /*flatten*/ ctx[3](/*dataLong*/ ctx[2]),
    				data: /*dataLong*/ ctx[2],
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Services Sector Continues Recovery";
    			t1 = space();
    			div = element("div");
    			create_component(layercake.$$.fragment);
    			attr_dev(h2, "class", "svelte-qujex7");
    			add_location(h2, file$9, 82, 0, 2481);
    			attr_dev(div, "class", "chart-container svelte-qujex7");
    			add_location(div, file$9, 83, 0, 2527);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);
    			mount_component(layercake, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const layercake_changes = {};

    			if (dirty & /*$$scope*/ 256) {
    				layercake_changes.$$scope = { dirty, ctx };
    			}

    			layercake.$set(layercake_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(layercake.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(layercake.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div);
    			destroy_component(layercake);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const xKey = "month";
    const yKey = "value";
    const zKey = "name";
    const func_1 = (a, b) => a - b;

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	const seriesNames = Object.keys(data[0]).filter(d => d !== xKey);

    	// console.log(seriesNames)
    	const seriesColors = ["#30bce0", "#beaf90"];

    	const parseDate = timeParse("%Y-%m-%d");

    	/* --------------------------------------------
     * Create a "long" format that is a grouped series of data points
     * Layer Cake uses this data structure and the key names
     * set in xKey, yKey and zKey to map your data into each scale.
     */
    	const dataLong = seriesNames.map(key => {
    		return {
    			[zKey]: key,
    			values: data.map(d => {
    				d[xKey] = typeof d[xKey] === "string"
    				? parseDate(d[xKey])
    				: d[xKey]; // Conditional required for sapper

    				return { [yKey]: +d[key], [xKey]: d[xKey] };
    			})
    		};
    	});

    	console.log(dataLong);

    	/* --------------------------------------------
     * Make a flat array of the `values` of our nested series
     * we can pluck the field set from `yKey` from each item
     * in the array to measure the full extents
     */
    	const flatten = data => data.reduce(
    		(memo, group) => {
    			return memo.concat(group.values);
    		},
    		[]
    	);

    	const formatTickX = timeFormat("%b. %e");
    	const formatTickY = d => format(`.${precisionFixed(d)}s`)(d);
    	const writable_props = [];

    	Object_1$3.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	const func = d => d[xKey];

    	$$self.$capture_state = () => ({
    		LayerCake,
    		Svg,
    		Html,
    		scaleOrdinal: ordinal,
    		timeParse,
    		timeFormat,
    		format,
    		precisionFixed,
    		MultiLine,
    		AxisX,
    		AxisY,
    		Labels: GroupLabels_html,
    		SharedTooltip: SharedTooltip_html,
    		data,
    		xKey,
    		yKey,
    		zKey,
    		seriesNames,
    		seriesColors,
    		parseDate,
    		dataLong,
    		flatten,
    		formatTickX,
    		formatTickY
    	});

    	return [seriesNames, seriesColors, dataLong, flatten, formatTickX, formatTickY, func];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    var hydrate = false;
    var config = {
    	hydrate: hydrate
    };

    const app = new App({
    	target: document.body,
    	hydrate: config.hydrate
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
