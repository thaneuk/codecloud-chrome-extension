/*
 * Copyright (c) 2017 Gregory Jackson. All rights reserved.
 */

(function (window, chrome) {
    'use strict';

    window.app = {
        init: function () {
            let me = this;

            chrome.storage.sync.get({
                ccOptions: {
                    baseUrl: 'https://codecloud.web.att.com/rest/api/latest/inbox/pull-requests',
                    updateInterval: 300000
                }
            }, items => {
                me.options = items.ccOptions;
                me.updateOutOptionsValues();
            });

            document.getElementById('save').addEventListener('click', function () {
                me.saveOptions();
            });
        },
        updateOutOptionsValues: function () {
            Object.keys(this.options).forEach(key => {
                let elm = document.getElementById(key);
                elm && (elm[elm.tagName === 'INPUT' ? 'value' : 'innerText'] = this.options[key]);
            });
        },
        saveOptions: function () {
            chrome.storage.sync.set({
                ccOptions: {
                    updateInterval: parseInt(document.getElementById('updateInterval').value)
                }
            }, () => {
                chrome.extension.getBackgroundPage().codeCloud.options.updateInterval = parseInt(document.getElementById('updateInterval').value);
                alert('saved');
            });
        }
    };

    window.app.init();

})(window, window.chrome);
