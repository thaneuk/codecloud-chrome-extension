/**!
 * Copyright 2017 Gregory Jackson
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

(function (window) {
    'use strict';

    /**
     * @description Generate an Ajax request within a Promise and return the promise
     * @function restCall
     * @param opts {object} options for the ajax request
     * @param opts.url {string} url for the ajax request
     * @param [opts.method] {string} method for the ajax request
     * @param [opts.data] {object} data to attach to the ajax request
     * @param [opts.timeout] {int} the ajax timeout value
     * @param [opts.withCredentials] {boolean} set the with credentials flag on the ajax
     * @return {object} returns a promise
     */
    window.restCall = function (opts) {
        let getData = '',
            postData = null;

        if (typeof opts !== 'object') {
            throw 'Missing Ajax Options';
        }

        if (!opts.hasOwnProperty('url')) {
            throw 'Missing Ajax Options: Url not specified';
        }

        if (opts.method && opts.method === 'POST' && opts.data && typeof opts.data === 'object') {
            postData = new FormData();
            Object.keys(opts.data).forEach(key => postData.append(key, opts.data[key]));
        }

        if (opts.method && opts.method === 'GET' && opts.data && typeof opts.data === 'object') {
            getData = [];
            Object.keys(opts.data).forEach(key => getData.push(`${key}=${opts.data[key]}`));
            getData = '?' + getData.join('&');
        }

        return new Promise(function (resolve, reject) {
            let ajaxCall = new XMLHttpRequest();

            ajaxCall.withCredentials = opts.withCredentials || false;

            ajaxCall.timeout = opts.timeout || 5000;

            ajaxCall.addEventListener('timeout', () => {
                reject('Ajax call timed out.');
                ajaxCall = null;
            });

            ajaxCall.addEventListener('error', e => {
                reject(e);
                ajaxCall = null;
            });

            ajaxCall.addEventListener('load', () => {
                resolve(ajaxCall.response);
                ajaxCall = null;
            });

            ajaxCall.open(opts.method || 'GET', opts.url + getData, true);

            ajaxCall.responseType = 'json';

            ajaxCall.send(postData);
        });
    };

})(window);
