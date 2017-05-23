/**!
 * Copyright 2017 Gregory Jackson
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

(function (window, chrome, restCall) {
    'use strict';

    window.codeCloud = {
        options: (() => {
            let options = {};

            chrome.storage.sync.get({
                ccOptions: {
                    baseUrl: 'https://codecloud.web.att.com/rest/api/latest/inbox/pull-requests',
                    updateInterval: 300000
                }
            }, items => Object.keys(items.ccOptions).forEach(key => options[key] = items.ccOptions[key]));

            return options;
        })(),
        callData: {
            role: 'reviewer',
            start: 0,
            limit: 10,
            withAttributes: true,
            state: 'OPEN',
            order: 'oldest'
        },
        pulls: {},
        init: function () {
            chrome.browserAction.onClicked.addListener(() => this.checkForPullRequests());

            chrome.runtime.onSuspend.addListener(() => this.stopPoll());

            chrome.runtime.onRestartRequired.addListener(() => this.stopPoll());

            chrome.runtime.onSuspendCanceled.addListener(() => this.startPoll());

            chrome.notifications.onClicked.addListener(id => this.clickedNotification(id));

            chrome.notifications.onButtonClicked.addListener((id, button) => this.clickedNotificationButton(id, button));

            window.setTimeout(() => this.checkForPullRequests(), 100);
        },
        checkForPullRequests: function () {
            this.pulls = {};

            restCall({
                method: 'GET',
                url: this.options.baseUrl,
                data: this.callData
            }).then(response => {
                if (response && response.values && Array.isArray(response.values)) {
                    response.values.forEach(pullRequest => {
                        if (pullRequest.reviewers.reduce((iss, reviewer) => {
                                return reviewer.status === 'UNAPPROVED' ? iss : iss + 1;
                            }, 0) === 0) {
                            this.postNotification(pullRequest);
                        }
                    });
                }

                this.startPoll();
            }, e => {
                window.console.error('Error with ajax while getting pull requests:', e);
                this.startPoll(900000);
            });
        },
        startPoll: function (updateDurationOverride) {
            window.clearTimeout(this.poll);
            this.poll = window.setTimeout(() => this.checkForPullRequests(), updateDurationOverride || this.options.updateInterval);
        },
        stopPoll: function () {
            window.clearTimeout(this.poll);
        },
        postNotification: function (pullRequest) {
            this.pulls[pullRequest.id.toString()] = pullRequest;

            if (pullRequest.open) {
                chrome.notifications.create(pullRequest.id.toString(), {
                    type: 'basic',
                    iconUrl: 'images/icon.png',
                    title: `Pull request from ${pullRequest.author.user.displayName}`,
                    message: `${pullRequest.title}`,
                    eventTime: Date.now(),
                    buttons: [{
                        title: 'View'
                    }]
                });
            } else {
                chrome.notifications.clear(pullRequest.id.toString());
            }
        },
        clickedNotificationButton: function (id, button) {
            if (button === 0 && this.pulls[id].links && this.pulls[id].links.self[0]) {
                chrome.tabs.create({
                    url: this.pulls[id].links.self[0].href
                });
                chrome.notifications.clear(id);
            }
        },
        clickedNotification: function (id) {
            chrome.notifications.clear(id);
        }
    };

    window.codeCloud.init();

})(window, window.chrome, window.restCall);
