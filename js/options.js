/**!
 * Copyright 2017 Gregory Jackson
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
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
