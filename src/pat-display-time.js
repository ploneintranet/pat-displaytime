
(function (root, factory) {
    // We use AMD (Asynchronous Module Definition) or browser globals to create
    // this module.
    if (typeof define === "function" && define.amd) {
        define([
            "jquery",
            "pat-base",
            "pat-registry",
            "pat-parser",
            "pat-logger",
            "moment",
        ], function() {
            return factory.apply(this, arguments);
        });
    } else {
        // If require.js is not available, you'll need to make sure that these
        // global variables are available.
        factory($, patterns.Base, patterns, patterns.Parser, patterns.logger, moment);
    }
}(this, function($, Base, registry, Parser, logger, moment) {
    "use strict";

    var log = logger.getLogger("pat-display-time");
    log.debug("pattern loaded");

    var lang = document.getElementsByTagName("html")[0].getAttribute("lang");
    if (lang) {
        // we don't support any country-specific language variants, always use first 2 letters
        lang = lang.substr(0,2).toLowerCase();
        import('moment/locale/' + lang + '.js').then(() => {
            moment.locale(lang);
        } )
    } else {
        moment.locale("en");
    }

    var parser = new Parser("display-time");

    // input datetime options
    parser.add_argument("format", "");
    parser.add_argument("locale", "en");
    parser.add_argument("strict", false);

    // output options
    parser.add_argument("from-now", false);
    parser.add_argument("no-suffix", false);
    parser.add_argument("output-format", "");

    return Base.extend({
        name: "display-time",
        trigger: ".pat-display-time",

        init: function initUndefined () {
            this.options = parser.parse(this.$el);
            log.debug("pattern initialized");
            this.processDate();
        },

        processDate: function patDisplayTimeProcessDate() {

            function importLocale(lang) {
                // en language is not in chunks, resolve it
                if (lang === 'en') {
                    return Promise.resolve();
                }

                // try to find language in chunks
                return import('moment/locale/' + lang + '.js')
                    .catch(() => {
                        // lang does not exists
                        // if language was not found, use default en
                        return null;
                    });
            }

            importLocale(lang).then(() => {
                // info about used language for moment
                console.log('Used language: ' + (lang || 'en'));


                var date_str = this.$el.attr("datetime");

                var date = moment(date_str, this.options.format, this.options.strict)
                    .locale(this.options.locale);
                if (this.options.fromNow === true) {
                    date = date.fromNow(this.options.noSuffix);
                } else if (this.options.outputFormat.length) {
                    date = date.format(this.options.outputFormat);
                }
                this.$el.text(date);
            })
        }
    });
}));
