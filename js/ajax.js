/*
 * Author: Gregory Jackson
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
                try {
                    resolve(window.JSON.parse(ajaxCall.responseText));
                } catch (e) {
                    resolve(ajaxCall.response);
                }
                ajaxCall = null;
            });

            ajaxCall.open(opts.method || 'GET', opts.url + getData, true);
            ajaxCall.send(postData);
        });
    };

})(window);
