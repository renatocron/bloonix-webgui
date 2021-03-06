// Start of encapsulation.
(function(){
"use strict";

var Utils = function() {};

Utils.escape = function(str){
    if (str == undefined) {
        return "";
    }
    if (typeof str == "number") {
        return str;
    }
    str = str.replace(/&/g, "&amp;");
    str = str.replace(/</g, "&lt;");
    str = str.replace(/>/g, "&gt;");
    str = str.replace(/"/g, "&quot;");
    str = str.replace(/'/g, "&#39;");
    return str;
};

Utils.replacePattern = function(str, data) {
    if (/:[a-zA-Z_0-9]+/.test(str)) {
        $.each(str.match(/(:[a-zA-Z_0-9]+)/g), function(i, match) {
            var repKey = match.replace(/:/g, "");
            str = str.replace(match, data[repKey]);
        });
    }
    return str;
};

Utils.joinHashElements = function(str, hash, array) {
    var ret, toJoin = [ ];

    $.each(array, function(i, elem) {
        toJoin.push(hash[elem]);
    });

    return toJoin.join(str);
};

Utils.extendArray = function(a, b) {
    $.each(b, function(i, row) {
        a.push(row);
    });
};

Utils.hexToRGB = function(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

    var r = parseInt(result[1], 16),
        g = parseInt(result[2], 16),
        b = parseInt(result[3], 16);

    return [ r, g, b ];
};

Utils.rgbToHex = function(color) {
    if (color.substr(0, 1) === "#") {
        return color;
    }

    var nums = /\((\d+),\s*(\d+),\s*(\d+)/i.exec(color),
        r = parseInt(nums[2], 10).toString(16),
        g = parseInt(nums[3], 10).toString(16),
        b = parseInt(nums[4], 10).toString(16);

    return "#"+ (
        (r.length == 1 ? "0"+ r : r) +
        (g.length == 1 ? "0"+ g : g) +
        (b.length == 1 ? "0"+ b : b)
    );
};

Utils.objectSize = function(obj) {
    var size = 0, key;

    for (key in obj) {
        size++;
    }

    return size;
};

Utils.create = function(e,o,t) {
    return $(document.createElement(e), o, t);
};

Utils.genRandStr = function(len, chars) {
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
        str = "";

    if (len == undefined) {
        len = 30;
    }

    for (var i=0; i<len; i++) {
        str += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return str;
};

Utils.dump = function(data, width, height) {
    var pre;

    if (width == undefined) {
        width = "800px";
    }
    if (height == undefined) {
        height = "800px";
    }

    if ($("#jsondump").length == 0) {
        pre = Utils.create("pre")
            .attr("id", "jsondump")
            .css({
                width: width,
                height: height,
                display: "inline-block",
                position: "fixed",
                top: "130px",
                right: "10px",
                padding: "10px",
                color: "#ffffff",
                "background-color": "rgba(0,0,0,.8)",
                overflow: "scroll",
                "z-index": 1000
            }).appendTo("body");
    } else {
        pre = $("#jsondump");
    }

    pre.html("Dump:<br/><br/>"+ Utils.escape(JSON.stringify(data, null, "\t")) +"<br/><br/>")
};

Utils.toJSON = function(obj) {
    return JSON.stringify(obj);
};

Utils.secondsToString = function(seconds) {
    var list = Utils.secondsToStringList(seconds);
    return list.join(":");
};

Utils.secondsToStringShortReadable = function(seconds) {
    var list = Utils.secondsToStringList(seconds);
    var toReturn = [ ];

    if (list[0] != "0") {
        toReturn.push(list[0] +"d");
        toReturn.push(list[1] +"h");
        toReturn.push(list[2] +"m");
    } else if (list[1] != "0") {
        toReturn.push(list[1] +"h");
        toReturn.push(list[2] +"m");
    } else if (list[2] != "0") {
        toReturn.push(list[2] +"m");
    }

    toReturn.push(list[3] +"s");
    return toReturn.join(", ");
};

Utils.secondsToStringReadable = function(seconds) {
    var list = Utils.secondsToStringList(seconds);
    list[0] += list[0] == "1" ? " "+ Text.get("word.day") : " "+ Text.get("word.days");
    list[1] += list[0] == "1" ? " "+ Text.get("word.hour") : " "+ Text.get("word.hours");
    list[2] += list[0] == "1" ? " "+ Text.get("word.minute") : " "+ Text.get("word.minutes");
    list[3] += list[0] == "1" ? " "+ Text.get("word.second") : " "+ Text.get("word.seconds");
    return list.join(", ");
};

Utils.secondsToStringList = function(seconds) {
    var minutes = 0, hours = 0, days = 0;
    if (seconds >= 86400) {
        days = Math.floor(seconds / 86400);
        seconds = seconds % 86400;
    }
    if (seconds >= 3600) {
        hours = Math.floor(seconds / 3600);
        seconds = seconds % 3600;
    }
    if (seconds >= 60) {
        minutes = Math.floor(seconds / 60);
        seconds = seconds % 60;
    }
    return [ days, hours, minutes, seconds ];
};

Utils.secondsToFormValues = function(a, nullStr) {
    var b = [];
    $.each(a, function(i, n) {
        var unit, value;

        if (nullStr != undefined && n == 0) {
            b.push({
                name: nullStr,
                value: n
            });
            return true;
        }

        if (n >= 86400) {
            value = n / 86400;
            name = value == 1 ? "day" : "days";
        } else if (n >= 3600) {
            value = n / 3600;
            name = value == 1 ? "hour" : "hours";
        } else if (n >= 60) {
            value = n / 60;
            name = value == 1 ? "minute" : "minutes";
        } else {
            value = n;
            name = value == 1 ? "second" : "seconds";
        }

        b.push({
            name: value +" "+ Text.get("word."+ name),
            value: n
        });
    });
    return b;
};

// Extend is used to extend the key-values of the second object
// to the first object. Existing keys of the first object will
// be overwritten.
Utils.extend = function(a, b) {
    if (a == undefined) {
        a = {};
    }
    if (b) {
        var n;
        for (n in b) {
            a[n] = b[n];
        }
    }
    return a;
};

/* Append is used to append the key-values of the second object
   to the first object. Existing keys of the first object will NOT
   be overwritten. In addition the key-values will only be appended
   to the first object if the first object is a object. That means
   if the first object is not an object then nothing happends. */
Utils.append = function(a, b) {
    if (a) {
        var n, c = {};
        // Javascript has no "exists" like in Perl. To check which
        // keys exists in the first object a "c" object is created.
        for (n in a) {
            c[n] = 1;
        }
        for (n in b) {
            if (c[n] != 1) { // if c[n] does not exists
                a[n] = b[n];
            }
        }
    }
};

/* Filter empty values from an object.
   Values are filtered if they are

      === undefined
      === false
      === zero length

   As example if the object to filter has

      b = { v: "", w: "a", x: false, y: 0, z: undefined };

  the returned object has

      a = { w: "a", y: 0 };

  as you can see... v, x and z are filtered.
*/
Utils.filterEmptyValues = function(b) {
    var a = {};

    if (b) {
        var n;
        for (n in b) {
            if (IsNot.empty(b[n])) {
                a[n] = b[n];
            }
        }
    }

    return a;
};

// Sort an object by key
Utils.sort = function(object, key) {
    var keys = [],
        sorted = [],
        objectByKey = {};

    $.each(object, function(i, o) {
        keys.push(o[key]);

        if (!objectByKey[o.key]) {
            objectByKey[o.key] = [];
        }

        objectByKey[o.key].push(o);
    });

    $.each(keys.sort(), function(x, k) {
        $.each(objectByKey[k], function(y, o) {
            sorted.push(o);
        });
    });

    return sorted;
};

Utils.bytesToStr = function(value, f) {
    var unit = "";

    if (f == undefined) {
        f = 1;
    }

    if (value >= 1208925819614629174706176) {
        value = value / 1208925819614629174706176;
        unit = "YB";
    } else if (value >= 1180591620717411303424) {
        value = value / 1180591620717411303424;
        unit = "ZB"
    } else if (value >= 1152921504606846976) {
        value = value / 1152921504606846976;
        unit = "EB";
    } else if (value >= 1125899906842624) {
        value = value / 1125899906842624;
        unit = "PB";
    } else if (value >= 1099511627776) {
        value = value / 1099511627776;
        unit = "TB";
    } else if (value >= 1073741824) {
        value = value / 1073741824;
        unit = "GB";
    } else if (value >= 1048576) {
        value = value / 1048576;
        unit = "MB";
    } else if (value >= 1024) {
        value = value / 1024;
        unit = "KB";
    }

    return value.toFixed(f) + unit;
};

Utils.open = function(href, title, opts) {
    window.open(href, title, opts);
};

Utils.syntaxHighlightJSON = function(json) {
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var cls = "color:darkorange;"
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = "color:red";
            } else {
                cls = "color:green";
            }
        } else if (/true|false/.test(match)) {
            cls = "color:blue";
        } else if (/null/.test(match)) {
            cls = "color:magenta";
        }
        return '<span style="' + cls + '">' + match + '</span>';
    });
};

Utils.escapeAndSyntaxHightlightJSON = function(json) {
    json = JSON.stringify(json, null, "  ");
    json = json.replace(/</g, "&lt;");
    json = json.replace(/>/g, "&gt;");
    json = json.replace(/\\r/g, "");
    json = json.replace(/\\n/g, "<br/>");
    json = Utils.syntaxHighlightJSON(json);
    return json;
};
var Ajax = function(o) {
    Utils.extend(this, o);

    this.defaults = {
        type: this.type || "post",
        contentType: "application/json; charset=utf-8",
        scriptCharset: "utf-8",
        dataType: "json",
        processData: false,
        async: true,
        // Because of a bug it's necessary to set a default data string.
        // If data is empty, then the content type is not send to the server.
        //data: "{}",
        error: function() {
            Log.error(
                "Failed to load data from server."
                +"Try it again and reload the site."
                +"Please contact an administrator if the request failed again."
            );
        }
    };

    this.err = {
        "err-400": function() { location.href = "/login/" },
        "err-405": function() { location.href = "/login/" },
        "err-410": function() { location.href = "/" },
        "err-700": function() { Bloonix.changeUserPassword({ force: true }) }
    };
};

Ajax.xhrPool = [];
Ajax.prototype = {
    token: false,
    tokenURL: "/token/csrf",
    ignoreErrors: {}
};

Ajax.prototype.request = function(o) {
    var self = this,
        success = o.success,
        handler = {},
        request = {},
        ignoreErrors = o.ignoreErrors;

    delete o.ignoreErrors;
    Utils.extend(request, this.defaults);
    Utils.extend(request, o);

    $.each([ "redirectOnError" ], function(i, h) {
        if (request[h] != undefined) {
            handler[h] = request[h];
            delete request[h];
        }
    });

    request.success = function(result) {
        Log.debug("response status: "+ result.status);

        if (result.status == "ok" || /^err-(605|610|620|70[12345])$/.test(result.status) || ignoreErrors[result.status] === true) {
            if (success != undefined) {
                success(result);
            }
            return false;
        }

        Log.error("request ("+ request.url +"):");
        Log.error(result);

        var infoErr;

        if (self.err[result.status]) {
            infoErr = self.err[result.status]();
        } else if (result.data && result.data.message) {
            infoErr = result.data.message;
        } else {
            infoErr = result.status;
        }

        if (infoErr) {
            $("#content").html(
                Utils.create("div")
                    .addClass("info-err")
                    .html(infoErr)
            );
            throw new Error();
        }
    };

    if (request.beforeSend == undefined) {
        request.beforeSend = Ajax.addXHRs;
    } else {
        var beforeSend = request.beforeSend;
        request.beforeSend = function(x) {
            Ajax.addXHRs(x);
            beforeSend(x);
        }
    }

    if (request.complete == undefined) {
        request.complete = Ajax.removeXHRs;
    } else {
        var complete = request.complete;
        request.complete = function(x) {
            Ajax.removeXHRs(x);
            complete(x);
        }
    }

    if (request.token === true) {
        request.token = false;
        Ajax.post({
            url: this.tokenURL,
            async: false,
            type: "get",
            success: function(result) {
                if (request.data == undefined) {
                    request.data = { };
                }
                request.data.token = result.data;
                Ajax.post(request);
            }
        });
    } else {
        if (typeof(request.data) == "object") {
            request.data = Utils.toJSON(request.data);
        }
        if (request.data == undefined) {
            request.type = "get";
        } else {
            request.type = "post";
        }
        Log.info("request "+ request.url);
        $.ajax(request);
    }
};

Ajax.post = function(req) {
    var ajax = new Ajax();
    return ajax.request(req);
};

Ajax.addXHRs = function(jqXHR) {
    Log.debug("begin add jqXHR, cur length "+ Ajax.xhrPool.length);
    Ajax.xhrPool.push(jqXHR);
    Log.debug("end add jqXHR, new length "+ Ajax.xhrPool.length);
};

Ajax.removeXHRs = function(jqXHR) {
    Log.debug("begin remove jqXHR, cur length "+ Ajax.xhrPool.length);
    var index = Ajax.xhrPool.indexOf(jqXHR);
    if (index > -1) {
        Ajax.xhrPool.splice(index, 1);
    }
    Log.debug("end remove jqXHR, new length "+ Ajax.xhrPool.length);
};

Ajax.abortXHRs = function() {
    if (Ajax.xhrPool.length > 0) {
        Log.debug("begin abort jqXHR, cur length" + Ajax.xhrPool.length);
        var xhr = Ajax.xhrPool.shift().abort();
        Ajax.abortXHRs();
        Log.debug("end abort jqXHR, new length" + Ajax.xhrPool.length);
    }
};
var Lang = {
   "en" : {
      "site.wtrm.attr.url" : "URL",
      "info.update_success" : "The update was successful!",
      "schema.service.action.enable_notifications_multiple" : "Enable notifications of the selected services",
      "schema.user_chart.text.editor" : "User chart editor",
      "schema.host_template.attr.description" : "Description",
      "schema.user.desc.timezone" : "Select the timezone of the user.",
      "schema.host.text.templates_not_assigned" : "Not assigned templates",
      "word.yes" : "yes",
      "schema.timeperiod.text.settings" : "Timeperiod settings",
      "schema.plugin_stats.attr.description" : "Description",
      "schema.dependency.attr.host_id" : "Host ID",
      "schema.service.text.multiple_help" : "<h4>This action requires to select at least one service.</h4>\nTo mark a single service just click on a row. If you want to mark multiple services\njust press and hold <i>CTRL</i> on your keyboard. If you press and hold <i>SHIFT</i>\nyou can mark a range of services.",
      "text.report.availability.timeout" : "Timeout",
      "word.From" : "From",
      "text.from_now_to_2h" : "From now + 2 hours",
      "site.login.error" : "Bad login! Try it again!",
      "schema.chart.desc.charts" : "<b>Select multiple charts with</b><br/><br/>\n<i>CTRL+click</i><br/>or<br/><i>SHIFT+click</i>",
      "nav.main.dashboard" : "DASHBOARD",
      "site.login.request_success" : "Your request was successful.<br/>\nAn administrator will contact you as soon as possible.",
      "schema.contact.desc.company_id" : "Select the company the contact belongs to.",
      "schema.host.action.disable_notifications_multiple" : "Disable notifications of the selected hosts",
      "text.dashboard.user_chart" : "Self created chart",
      "schema.user.attr.phone" : "Phone",
      "schema.contactgroup.attr.id" : "Contactgroup ID",
      "schema.dependency.text.workflow_timezone" : "Set the timezone for the timeslice",
      "site.login.request_password" : "Request a new password.",
      "schema.service.attr.message" : "Status information",
      "schema.service.attr.sms_warnings" : "Send WARNINGS per SMS",
      "schema.group.text.create" : "Create a new group",
      "schema.host.desc.company_id" : "Select the company the host belongs to.",
      "schema.contact.text.delete" : "Delete contact",
      "schema.service.attr.last_sms" : "Last notification per SMS",
      "schema.host.attr.hw_product" : "HW product",
      "schema.host.desc.status" : "The status of the host. Possible values are OK, INFO, WARNING, CRITICAL or UNKNOWN.",
      "schema.host.attr.os_product" : "OS product",
      "schema.service.desc.fd_enabled" : "This option enables or disables the flap detection. The flap detection is very useful to detect services that switches between OK and not OK in a very short time and when the counter of <i>attempt max</i> is never reached. The flap detection checkes how many times a service switched between different states in a given time. If the status switched to many times, then a notification will be triggered.",
      "schema.timeslice.attr.timeslice" : "Timeslice",
      "action.overview" : "Overview",
      "text.change_the_language" : "Change the language",
      "schema.dependency.text.workflow_to_host_status" : "Select the status of the parent host that avoids a notification",
      "schema.user_chart.text.add_metric" : "Add metric",
      "text.thresholds" : "Thresholds",
      "schema.plugin_stats.attr.statkey" : "Key",
      "site.wtrm.command.checkIfElementIsChecked" : "Check if the radio button or checkbox <b>%s</b> is checked",
      "text.last_180d" : "Last 180 days",
      "text.report.availability.h03" : "03:00 - 03:59",
      "site.wtrm.command.checkIfElementHasNotText" : "Check if the element <b>%s</b> does <i>NOT</i> contain <b>%s</b>",
      "schema.service.attr.last_check" : "Last check",
      "schema.host_template.attr.name" : "Template name",
      "nav.sub.contacts" : "Contacts",
      "text.report.availability.detailed_report_onclick" : "Click on a service to get a detailed availabilty report.",
      "schema.service.desc.multiple_check_type_locations" : "Select at least 3 checkpoints:",
      "word.Hosts" : "Hosts",
      "schema.contact.text.escalation_level_event.0" : "permanent active",
      "site.wtrm.attr.contentType" : "Content-Type",
      "schema.host.text.multiple_notification" : "Enable or disable the notifications of multiple hosts",
      "schema.host_downtime.text.title" : "Scheduled downtimes for host %s",
      "schema.sms_send.attr.message" : "Message",
      "schema.company.attr.city" : "City",
      "schema.service.desc.attempt_max" : "This option controls when you gets a notification of services that are not in status OK. As example a value of 3 means that you get a notification first if the service check returns 3 times in a row a not OK status.",
      "site.help.doc.host-variables" : "Host Variablen",
      "nav.sub.downtimes" : "Scheduled downtimes",
      "schema.dependency.text.workflow_timeslice" : "Set the timeslice when the dependency is active",
      "text.report.title.host_from_to" : "Report for host <b>%s</b> from <b>%s</b> to <b>%s</b>",
      "schema.group.text.delete" : "Delete group",
      "schema.dependency.attr.on_service_id" : "Depends on service ID",
      "schema.host.attr.sysinfo" : "System information",
      "schema.host.attr.location" : "Location",
      "schema.timeperiod.attr.id" : "Timeperiod ID",
      "schema.user.text.password_update" : "Please enter a new password.",
      "text.report.availability.AV-I" : "Time slice in percent in which the service was in status INFO.",
      "schema.contact.attr.name" : "Name",
      "site.wtrm.action.doUncheck" : "Uncheck a <b>radio button</b> or <b>checkbox</b>",
      "schema.user.attr.password_changed" : "Password changed?",
      "schema.timeslice.text.list" : "Overview of all timeslices",
      "text.report.availability.lt15" : "Between 0 and 15 minutes",
      "word.Language" : "Language",
      "schema.host.attr.os_manufacturer" : "OS manufacturer",
      "schema.user_chart.text.chart_metrics" : "Chart metrics",
      "site.wtrm.placeholder.contentType" : "text/html",
      "site.wtrm.command.checkUrl" : "Check if the URL in the address bar is <b>%s</b>",
      "err-701" : "Incorrect password!",
      "schema.company.text.list" : "Overview of all companies",
      "schema.host.info.notification_disabled" : "Notifications are disabled of the host.",
      "schema.event.attr.last_status" : "Last status",
      "nav.sub.notifications" : "Notifications",
      "site.wtrm.command.checkIfElementIsNotSelected" : "Check if the value <b>%s</b> of the selectbox <b>%s</b> is <i>NOT</i> selected",
      "schema.contact.text.timeperiod_type_send_only_mail" : "Send only mail",
      "schema.event.text.filter_message" : "Filter message",
      "site.wtrm.action.checkIfElementHasNotValue" : "Check if an <b>input</b> field or <b>textarea has <i>NOT</i></b> a specified <b>value</b>",
      "schema.service.attr.attempt_max" : "Notify after X attempts",
      "action.submit" : "Submit",
      "site.wtrm.attr.ms" : "Milliseconds",
      "err-500" : "An internal error occured! Please contact the administrator!",
      "schema.contactgroup.text.host_nonmembers" : "Hosts in group",
      "site.wtrm.attr.value" : "Value",
      "schema.contactgroup.text.service_members" : "Services in contact group",
      "schema.service.attr.fd_enabled" : "Flap detection enabled",
      "schema.host.desc.interval" : "This is the check interval of all services of the host.",
      "action.unselect" : "Unselect",
      "schema.host.desc.max_services" : "Set the maximum number of services that can be configured for the host. 0 means unlimited.",
      "schema.dependency.text.service" : "Service",
      "schema.service.desc.sms_ok" : "This option enables or disables notifications if the service is in status OK.",
      "err-705" : "The new and the old password cannot be the same!",
      "text.dashboard.reconfigure_dashlet" : "Configure dashlet",
      "schema.company.attr.active" : "Active",
      "action.remove" : "Remove",
      "site.wtrm.desc.html" : "The inner HTML of an element you wish to check.",
      "word.Seconds" : "Seconds",
      "schema.contactgroup.text.service_nonmembers" : "Services not in contact group",
      "schema.user.desc.comment" : "This field can be used for internal comment about the user.",
      "site.wtrm.action.checkIfElementHasText" : "Check if an <b>element</b> contains <b>text</b> ",
      "schema.hs_downtime.attr.timezone" : "Timezone",
      "schema.service.info.notification_disabled" : "Notifications are disabled of the service.",
      "text.from_now_to_8h" : "From now + 8 hours",
      "schema.service.desc.default_check_type_location" : "Your service is checked from the following checkpoint:",
      "site.help.doc.host-parameter" : "Host Parameter im Detail",
      "schema.service.attr.mail_hard_interval" : "Notification interval for mails (hard)",
      "nav.sub.contactgroups" : "Contactgroups",
      "action.refresh" : "Refresh",
      "info.no_chart_data" : "There are no chart data available.",
      "text.report.availability.h12" : "12:00 - 12:59",
      "site.wtrm.command.checkIfElementExists" : "Check if the element <b>%s</b> exists",
      "schema.chart.text.chart_type" : "Select the chart type",
      "text.report.availability.EV-U" : "Number of events with status UNKNOWN.",
      "schema.service.attr.id" : "Service ID",
      "bool.yesno.1" : "yes",
      "schema.service.desc.default_check_type" : "A default check has a pre-defined checkpoint.\nFrom this checkpoint your service is checked.",
      "text.report.availability.EV-LT180" : "Number of events with a status duration less than 3 hours.",
      "schema.host.attr.interval" : "Interval",
      "schema.service.text.multiple_downtimes" : "Schedule a downtime for multiple services",
      "site.help.doc.service-parameter" : "Service Parameter im Detail",
      "schema.service.desc.interval" : "This is the check interval of the service. If no value is set, then the interval of the host is inherited.",
      "site.wtrm.desc.element" : "The element you want to select. As example: #id, .class, name",
      "schema.user_chart.attr.yaxis_label" : "Y-axis label",
      "action.view" : "View",
      "word.Minutes" : "Minutes",
      "text.option_examples" : "Option examples",
      "schema.host_template.text.setting" : "Template settings",
      "schema.contact.text.create" : "Create a new contact",
      "schema.chart.attr.from" : "From",
      "text.last_90d" : "Last 90 days",
      "text.report.availability.EV-LT30" : "Number of events with a status duration less than 30 minutes.",
      "schema.dependency.text.for_node" : "Dependencies for node <b>%s</b>",
      "text.report.availability.Events" : "Number of total events.",
      "schema.user.desc.password_changed" : "Set the value to <i>no</i> if you want to force the user to change the password after the first login.",
      "schema.host_template.text.view_members" : "Add / Remove hosts",
      "schema.host.desc.add_host_to_group" : "Add the host at least to one group.",
      "schema.plugin.text.list" : "Plugins",
      "site.wtrm.text.click_for_details" : "Click on a row to get a detailed report",
      "schema.service.text.select_location_check_type" : "Select the type of the check",
      "err-601" : "The objects you requested does not exists!",
      "err-420" : "The action failed!",
      "schema.service.desc.send_sms" : "This option enables or disables notifications per SMS.",
      "text.unlimited" : "Unlimited",
      "schema.chart.attr.preset" : "Preset",
      "site.wtrm.command.doUrl" : "Go to URL <b>%s</b>",
      "schema.event.attr.time" : "Timestamp",
      "schema.host.text.create" : "Create a new host",
      "site.wtrm.action.doClick" : "<b>Click</b> on a element",
      "text.chart_info" : "Chart information",
      "schema.group.text.may_modify_services" : "May modify services",
      "schema.user_chart.attr.description" : "Description",
      "schema.contact.desc.name" : "This is the full name of the contact.",
      "schema.service.action.disable_notifications_multiple" : "Disable notifications of the selected services",
      "action.redirect" : "Redirect",
      "schema.host.action.remove_template" : "Remove template",
      "text.dashboard.use_mouse_wheel_to_zoom" : "Use the mouse wheel to zoom in and out.",
      "schema.host.attr.password" : "Password",
      "schema.sms_send.attr.send_to" : "Receipient",
      "text.dashboard.name" : "Name of the dashboard",
      "schema.timeperiod.desc.description" : "This is a short description of the timeperiod.",
      "site.wtrm.attr.hidden" : "Hide",
      "text.report.availability.AV-C" : "Time slice in percent in which the service was in status CRITICAL.",
      "err-416" : "You do not have enough access privileges for this operation!",
      "schema.chart.attr.charts" : "Charts",
      "schema.company.attr.country" : "Country",
      "schema.host.desc.os_manufacturer" : "e.g. Red Hat, Microsoft, CISCO",
      "site.wtrm.action.doSubmit" : "<b>Submit</b> a form",
      "site.wtrm.command.doSleep" : "Sleep <b>%s</b>ms",
      "schema.roster.attr.id" : "Roster ID",
      "schema.host.attr.status" : "Status",
      "site.wtrm.action.doSelect" : "<b>Select</b> a value from a selectbox",
      "schema.host.text.mtr_chart" : "MTR chart",
      "schema.service.text.sla_requirements" : "Please note that for free accounts only the default check is available!",
      "action.abort" : "Abort",
      "text.report.availability.h08" : "08:00 - 08:59",
      "action.move_box" : "Move the box",
      "schema.company.attr.fax" : "Fax",
      "schema.timeslice.text.delete" : "Delete timeslice",
      "schema.contact.text.timeperiod_type_exclude" : "Exclude",
      "schema.service.desc.fd_time_range" : "This is the period the flap detection checks for status switches.",
      "action.login" : "Login",
      "nav.sub.contactgroup_service_members" : "Services in contact group",
      "schema.user.text.is_logged_in" : "Logged in",
      "text.browsers_heap_size" : "Display of the heap size in your browser",
      "text.from_now_to_4d" : "From now + 4 days",
      "site.help.doc.users-and-groups" : "Die Benutzer- und Gruppenverwaltung",
      "schema.contact.text.timeperiod_type" : "Include / Exclude",
      "site.wtrm.action.doUserAgent" : "Set the <b>user agent</b> for the request",
      "text.report.availability.h15" : "15:00 - 15:59",
      "nav.sub.contactgroup_host_members" : "Hosts in contact group",
      "schema.hs_downtime.attr.timeslice" : "Timeslice",
      "site.wtrm.placeholder.userAgent" : "User-Agent",
      "text.from_now_to_1d" : "From now + 1 day",
      "text.report.availability.AV-U" : "Time slice in percent in which the service was in status UNKNOWN.",
      "schema.host.attr.max_services" : "Max services",
      "schema.user.attr.password" : "Password",
      "site.wtrm.placeholder.hidden" : "Hide this value?",
      "text.report.availability.h07" : "07:00 - 07:59",
      "schema.service.text.multiple" : "Service actions",
      "schema.host.attr.allow_from" : "Allow from",
      "schema.host.desc.variables" : "In this field you can define host variables. These variables can be used for thresholds by the configuration of service checks. Example:<br/><br/>HTTP.PORT=9000<br/><br/>This variable could be used in the format <i>%HTTP.PORT%</i> for thresholds. Please note that two variables are pre-defined: <i>IPADDR</i> and <i>HOSTNAME</i>. These variables are replaced with the IP address and the hostname of the host. For further information read the help.<br/><br/>Allowed signs: a-z, A-Z, 0-9, dot and underscore",
      "schema.contact.attr.mail_notifications_enabled" : "E-Mail global enabled",
      "site.wtrm.command.doAuth" : "Use auth basic with username <b>%s</b> and password <b>%s</b>",
      "schema.host.text.list_templates" : "Host %s has the following templates configured",
      "schema.host.text.multiple_downtimes" : "Schedule a downtime for multiple hosts",
      "schema.host_template.text.clone" : "Clone the template",
      "site.wtrm.placeholder.text" : "Lorem ipsum...",
      "schema.host.desc.sysinfo" : "This field allows you to set an external link to you own host documentation, e.g.: https://mysite.test/?id=12345.<br/><br/>Not allowed characters: \"\\",
      "schema.user.attr.last_login" : "Last login",
      "schema.service.attr.passive_check" : "Is this a passive check?",
      "info.create_failed" : "The creation was not successful!",
      "schema.host.attr.ipaddr" : "IP-Address",
      "schema.chart.text.multiple_view" : "Chart view",
      "schema.plugin.attr.info" : "Information",
      "schema.service.attr.host_alive_check" : "Is this a host alive check?",
      "schema.contact.attr.sms_notifications_enabled" : "SMS global enabled",
      "text.report.availability.EV-LT15" : "Number of events with a status duration less than 15 minutes.",
      "schema.plugin_stats.attr.datatype" : "Data type",
      "schema.timeperiod.text.list" : "Overview of all timeperiods",
      "action.add" : "Add",
      "action.show_selected_objects" : "Show selected objects",
      "schema.plugin_stats.attr.alias" : "Name",
      "nav.sub.companies" : "Companies",
      "text.dashboard.dashlet_configuration" : "Dashlet configuration",
      "schema.user.desc.manage_contacts" : "Is the user allowed to manage contacts?",
      "schema.host.action.activate_multiple" : "Activate the selected hosts",
      "text.report.availability.lt180" : "Between 1 and 3 hours",
      "text.report.title.number_of_events_by_duration" : "Number of events by duration",
      "text.report.availability.GE300" : "Filter events with a status duration greater than 5 hours.",
      "schema.company.attr.address1" : "Address 1",
      "text.report.availability.lt60" : "Between 30 and 60 minutes",
      "nav.sub.events" : "Events",
      "schema.service.action.clear_acknowledgement_multiple" : "Clear the acknowledgement of the selected services",
      "site.wtrm.action.checkIfElementIsNotSelected" : "Check if a <b>value is <i>NOT</i> selected</b> in a selectbox",
      "schema.service.attr.last_mail_time" : "Last notification per mail",
      "schema.service.attr.active" : "Active",
      "schema.group.desc.description" : "Enter a short description about the group.",
      "schema.service.desc.host_alive_check" : "A host alive check is a check that determines if a host is down or alive. If this check returns a critical status then you get a special notification. If other service checks returns a critical status at the same time then the notifications will be suppressed. It's recommended you use the ping check as host alive check.",
      "schema.host.desc.virt_product" : "e.g. VMware-Server, Virtuozzo",
      "schema.host.attr.notification" : "Notifications enabled",
      "schema.service.desc.multiple_check_select_concurrency" : "Select the concurrency:",
      "text.report.availability.fatal" : "Fatal issue",
      "schema.service.text.multiple_force_next_check" : "Force that the services are checked as soon as possible",
      "schema.service.attr.mail_ok" : "Send OK notifications per mail",
      "text.sort_by_dots" : "Sort by ...",
      "word.Services" : "Services",
      "site.wtrm.desc.userAgent" : "This is the User-Agent to send for all requests.",
      "nav.main.help" : "HELP",
      "schema.chart.attr.from_to" : "From <b>%s</b> to <b>%s</b>",
      "schema.plugin.attr.command" : "Command",
      "text.report.availability.LT300" : "Filter events with a status duration less than 5 hours.",
      "err-415" : "Unauthorized access!",
      "word.second" : "second",
      "schema.host.desc.os_product" : "e.g. RHEL5, Debian Lenny, Windows Server 2003",
      "err-427" : "Services that are inherited from a host template can't be deleted!",
      "action.yes_remove" : "<b>Yes, remove!</b>",
      "err-632" : "The parameter limit must be an numeric value, min 0, max <b>%s</b>.",
      "site.wtrm.text.quick_check" : "Quick check!",
      "schema.hs_downtime.attr.description" : "Description",
      "schema.service.text.host_alive_check" : "Host-Alive-Check",
      "schema.timeperiod.text.create" : "Create a new timeperiod",
      "text.filter_by_category_dots" : "Filter by category ...",
      "schema.service.desc.multiple_check_type_title" : "Multiple checkpoints",
      "site.wtrm.desc.parent" : "It's possible to set a parent ID. The ID, class or name is searched within the element of the parent ID.",
      "err-400" : "Bad login! Try it again!",
      "text.report.availability.h01" : "01:00 - 01:59",
      "nav.sub.timeperiods" : "Timeperiods",
      "nav.sub.groups" : "Groups",
      "site.wtrm.action.checkIfElementNotExists" : "Check if an <b>element does <i>NOT</i> exists</b>",
      "text.report.availability.AV-O" : "Time slice in percent in which the service was in status OK.",
      "action.safe" : "Safe",
      "err-610" : "Please fill in the red marked fields correctly!",
      "text.report.availability.h05" : "05:00 - 05:59",
      "text.dashboard.remove_dashlet" : "Remove the dashlet",
      "schema.company.attr.title" : "Title",
      "schema.service.desc.multiple_check_concurrency_title" : "Concurrency checks",
      "text.report.title.number_of_events" : "The total number of events",
      "action.generate" : "Generate",
      "schema.contact.desc.mail_notification_level" : "Select the status level for which you want to receive notifications.",
      "schema.service.text.rotate_location_check_button" : "Rotate check",
      "schema.sms_send.text.search" : "Search for SMS",
      "schema.host.info.sysinfo" : "External system information available.",
      "site.wtrm.placeholder.parent" : "#parent-id (optional)",
      "schema.event.attr.attempts" : "Attempts",
      "action.resize" : "Resize",
      "schema.service.attr.default_location" : "Default location",
      "text.report.availability.LT60" : "Filter events with a status duration less than 60 minutes.",
      "text.report.availability.EV-C" : "Number of events with status CRITICAL.",
      "schema.service.attr.mail_warnings" : "Send WARNINGS per mail",
      "schema.company.desc.active" : "Activate or de-activate all objects of this company.",
      "word.seconds" : "seconds",
      "schema.host_template.test.host_members" : "Hosts in group",
      "schema.company.attr.email" : "E-Mail",
      "site.wtrm.action.checkIfElementHasHTML" : "Check if an <b>element</b> contains <b>HTML</b>",
      "schema.service.desc.multiple_check_concurrency" : "Please note that the checks are executed\nconcurrent from multiple checkpoints. To avoid overloading your service, you can specify\nthe maximum number of concurrent executions.",
      "schema.company.text.settings" : "Company settings",
      "info.update_failed" : "The update was not successful!",
      "text.dashboard.service_chart" : "Service chart",
      "action.filter" : "Filter",
      "site.wtrm.command.doCheck" : "Check the radio button or checkbox of element <b>%s</b> with value <b>%s</b>",
      "schema.host.text.view" : "Host %s",
      "schema.dependency.text.workflow_inherit" : "Activate inheritation",
      "schema.service.desc.is_volatile" : "With this option you can define if the service check is <i>volatile</i>. Some service checks have the peculiarity that they are only for a very short time in a CRITICAL status. As example if you check a logfile for specific strings, like <i>possible break-in attempt</i> and the check returns a CRITICAL status because the string were found, then it's possible that the next check does not find the string any more and would return the status OK. In this case it's possible that you would never notice that someone tried to break in. For this purpose you can define the service a volatile. That means that the service stays in a CRITCAL or WARNING state until you clear the volatile status.",
      "schema.dependency.attr.timezone" : "Timezone",
      "err-630" : "Invalid parameter settings found!",
      "schema.contact.text.remove_timeperiod" : "Remove timeperiod from contact",
      "text.report.availability.h00" : "00:00 - 00:59",
      "schema.host_template.text.selected_hosts" : "Selected hosts",
      "action.clone" : "Clone",
      "schema.user.desc.username" : "Enter the username in the format <i>user@domain.test</i>.",
      "action.configure" : "Configure",
      "text.report.availability.EV-GE300" : "Number of events with a status duration greater than 5 hours.",
      "site.wtrm.command.checkIfElementIsSelected" : "Check if the value <b>%s</b> of the selectbox <b>%s</b> is selected",
      "schema.host.attr.virt_manufacturer" : "Virtualization manufacturer",
      "schema.chart.text.back_to_selection" : "Back to the chart selection",
      "schema.host.attr.variables" : "Host variables",
      "action.select" : "Select",
      "schema.host.desc.hostname" : "This is the fully qualified hostname.",
      "text.dashboard.create_dashboard" : "Create an empty dashboard",
      "schema.contactgroup.text.selected_services" : "Selected services",
      "schema.company.attr.id" : "Company ID",
      "schema.service.text.host_template" : "Host template",
      "text.report.service_has_a_availabilty_of" : "Service <b>%s</b> has a availability of",
      "schema.service.attr.acknowledged" : "Service status acknowledged",
      "nav.sub.charts" : "Charts",
      "schema.contact.text.timeperiod_type_send_to_all" : "Send as mail and SMS",
      "word.hour" : "hour",
      "schema.service.text.no_command_options" : "This check has no settings.",
      "schema.host.attr.coordinates" : "Coordinates",
      "schema.service.desc.comment" : "This is a short internal comment to the check.",
      "site.help.doc.user-charts" : "Benutzer Charts",
      "site.wtrm.placeholder.url" : "http://www.bloonix.de/",
      "text.second_failover_checkpoint" : "Second failover checkpoint",
      "text.dashboard.services_availability" : "Availability of all services",
      "schema.chart.text.multiselect" : "Select charts for multiple hosts",
      "schema.host.desc.description" : "This is a short description of the host.",
      "schema.contact.attr.escalation_level" : "Escalation level",
      "schema.user.desc.role" : "Which role does the user have? Users with the role <i>operator</i> are power users and can manage user accounts and user groups. Users with the role <i>user</i> are not allowed to manage other users and groups.",
      "schema.host.text.multiple_selection_help" : "<h4>This action requires to select at least one host.</h4>\nTo mark a single host just click on a row. If you want to mark multiple hosts\njust press and hold <i>CTRL</i> on your keyboard. If you press and hold <i>SHIFT</i>\nyou can mark a range of hosts.",
      "site.wtrm.action.doCheck" : "Check a <b>radio button</b> or <b>checkbox</b>",
      "text.report.availability.h10" : "10:00 - 10:59",
      "action.action" : "Action",
      "schema.group.text.group_members" : "Members of group <b>%s</b>",
      "schema.service.text.multiple_activate" : "Activate or deactivate multiple services",
      "text.report.availability.Availability" : "The total availability.",
      "site.login.password" : "Password",
      "schema.host.desc.hw_product" : "e.g. Dell Power Edge 2950",
      "text.dashboard.really_delete_dashboard" : "Do you really want to delete the dashboard %s?",
      "schema.timeperiod.attr.description" : "Description",
      "schema.contact.attr.sms_to" : "Mobil number",
      "schema.chart.attr.refresh" : "Refresh",
      "text.dashboard.list_top_hosts" : "Overview of the top hosts",
      "schema.group.attr.description" : "Description",
      "err-410" : "The requested URL was not found!",
      "err-640" : "No data available!",
      "action.timeslices" : "List timeslices",
      "schema.service.text.notification_settings" : "Notification settings",
      "err-631" : "The parameter offset must be an numeric value, min 0.",
      "schema.host.text.add_host_to_host_template" : "Add the host to a host template",
      "schema.host_template.attr.id" : "Template ID",
      "site.wtrm.desc.password" : "This password for the auth basic authentification.",
      "schema.dependency.attr.service_id" : "Service ID",
      "schema.company.attr.sla" : "SLA",
      "schema.contact.text.timeperiod_type_send_only_sms" : "Send only SMS",
      "err-426" : "This action requires a token!",
      "action.search" : "Search",
      "schema.group.text.update_user" : "Modify access rights",
      "text.report.availability.h18" : "18:00 - 18:59",
      "site.wtrm.action.checkIfElementIsNotChecked" : "Check if a <b>radio button</b> or <b>checkbox is <i>NOT</i> checked</b>",
      "site.wtrm.text.check_it" : "Check it!",
      "action.reload" : "Reload",
      "schema.user.text.create" : "Create a new user",
      "text.report.availability.h06" : "06:00 - 06:59",
      "schema.user_chart.text.click_to_add_metric" : "Click to add the metric",
      "schema.timeperiod.desc.name" : "This is the name of the timeperiod.",
      "site.login.contact" : "Do you have questions?",
      "schema.service.attr.send_sms" : "Notifications per SMS enabled",
      "nav.sub.dependencies" : "Dependencies",
      "site.wtrm.command.checkIfElementHasText" : "Check if the element <b>%s</b> contains <b>%s</b>",
      "text.report.availability.h04" : "04:00 - 04:59",
      "schema.chart.text.chart_id" : "Chart-ID: %s",
      "text.report.availability.h20" : "20:00 - 20:59",
      "schema.service.desc.attempt_warn2crit" : "This option is useful if you want that the status of the service upgrades to CRITICAL if the real status is WARNING and the max attempts are reached.",
      "schema.dependency.text.service_to_host" : "service to host",
      "schema.host.attr.last_check" : "Last check",
      "word.Timezone" : "Timezone",
      "word.minute" : "minute",
      "action.settings" : "Settings",
      "site.wtrm.action.checkUrl" : "Check the <b>URL</b> in the address bar",
      "site.wtrm.command.doUncheck" : "Uncheck the radio button or checkbox <b>%s</b> with value <b>%s</b>",
      "text.from_now_to_2d" : "From now + 2 days",
      "schema.user_chart.attr.id" : "ID",
      "text.report.availability.EV-O" : "Number of events with status OK.",
      "info.move_with_mouse" : "Press and hold down the left mouse button while you move the box up or down.</p>",
      "schema.contact.attr.company_id" : "Company ID",
      "schema.group.text.add" : "Add a new user to the group",
      "schema.dependency.text.host_to_host" : "host to host",
      "schema.host_template.text.delete" : "Delete a template",
      "schema.group.text.may_delete_services" : "May delete services",
      "schema.dependency.text.depends_on_host" : "depends on host",
      "schema.host.desc.virt_manufacturer" : "e.g. VMware, Parallels",
      "schema.contact.desc.escalation_level" : "Select an escalation level for the contact. With the escalation level it's possible to control when a contact gets a notification. The escalation level <i>permanent active</i> means that the contact gets the event notifications every time. The escalation level <i>active after 3 notifications</i> means that the contact gets a notification first if already 3 notifications were sent and the service is still not OK.",
      "schema.company.attr.sms_enabled" : "SMS notifications enabled",
      "err-620" : "This object already exists!",
      "schema.host.attr.max_sms" : "Max SMS per month",
      "nav.sub.user_group_settings" : "User group settings",
      "schema.plugin.attr.id" : "Plugin-ID",
      "schema.user.attr.username" : "Username",
      "schema.chart.attr.options" : "Chart options",
      "schema.service.attr.check_by_location" : "Check by location (agent ID)",
      "schema.service.desc.fd_flap_count" : "This is the threshold for the flap detection. If more than x-times the status switched in a given time a notificaton is triggered.",
      "nav.sub.users" : "Users",
      "site.wtrm.command.doClick" : "Click on element <b>%s</b>",
      "text.report.title.status_duration_by_hour" : "Status duration by time range",
      "site.wtrm.placeholder.username" : "Username",
      "schema.service.desc.agent_tooltip" : "<h3>Installation of the Bloonix-Agent</h3>\n<p>\nThis check is executed on your server and requires that you install the Bloonix-Agent\nand the plugin on your server.\n</p>",
      "text.report.availability.security" : "Security issue",
      "nav.sub.group_settings" : "Group settings",
      "schema.event.attr.id" : "Event ID",
      "schema.host_template.text.view_services" : "View services",
      "site.login.forgot_password_info" : "Please note that the new password is not send\nautomatically to your registered e-mail address. An administrator will check\nyour request at first and contact you as soon as possible.",
      "schema.host.desc.allow_from" : "With this field it's possible to set a comma separated list of IP addresses from which the Bloonix agents are allowed to deliver host statistics. Set the keyword <i>all</i> to allow all IP addresses.",
      "schema.contactgroup.text.contact_members" : "Contacts in contact group",
      "schema.dependency.attr.inherit" : "Inheritance",
      "schema.contactgroup.text.group_members" : "Members of contact group '<b>%s</b>'",
      "schema.service.attr.description" : "Description",
      "site.wtrm.command.checkIfElementHasNotValue" : "Check if the input field or textarea with element <b>%s</b> does <i>NOT</i> contain <b>%s</b>",
      "text.report.availability.volatile" : "Volatile",
      "schema.service.attr.status_since" : "Status since",
      "schema.user.text.repeat_password" : "Repeat the new password",
      "bool.yesno.0" : "no",
      "schema.host.desc.sysgroup" : "This is a complete free to use field with no restrictions.",
      "schema.host.text.settings" : "Host settings",
      "schema.service.text.default_location_check_button" : "Default check",
      "schema.service.attr.volatile_retain" : "The volatile retain time",
      "schema.service.attr.plugin" : "Plugin",
      "schema.user.attr.id" : "User ID",
      "action.logout" : "Logout",
      "schema.roster.attr.active" : "Active",
      "schema.service.desc.failover_check_type" : "With failover checks it's possible to select a fixed\ncheckpoint from which the service is checked. In addition it's possible to select two\nfailover checkpoints, from which the service is checked if the check from the fixed checkpoint\nreturns a status that is not OK. If the status of all 3 checkpoints is not OK, the counter\nof <i>attempt max</i> is increased.",
      "site.wtrm.action.doWaitForElement" : "Wait for element",
      "schema.service.action.clear_volatile_multiple" : "Clear the volatile status of the selected services",
      "text.click_to_delete_seletion" : "Click to delete the selection",
      "schema.group.desc.company" : "Select the company the group belongs to.",
      "err-702" : "The new password is to long (max 128 signs)!",
      "schema.company.attr.state" : "State/Province",
      "schema.chart.attr.datetime" : "Date and time",
      "schema.chart.text.delete_view" : "Delete chart view",
      "schema.dependency.text.active_time" : "Active time",
      "schema.service.text.multiple_volatile" : "Clear the volatile status of multiple services",
      "action.generate_string" : "Generate a random string",
      "text.report.availability.EV-W" : "Number of events with status WARNING.",
      "schema.service.attr.service_name" : "Service name",
      "schema.service.text.attempt" : "Attempts",
      "schema.host.attr.id" : "Host ID",
      "site.wtrm.command.checkIfElementHasValue" : "Check if the input field or textarea with element <b>%s</b> contains <b>%s</b>",
      "schema.contact.text.list" : "Overview of all contacts",
      "schema.service.attr.agent_id" : "Location",
      "text.click_me" : "Click me",
      "schema.service.desc.default_check_type_title" : "Default checkpoint",
      "schema.user_chart.text.user_chart" : "Chart editor",
      "site.wtrm.command.checkUrlWithContentType" : "Check if the URL <b>%s</b> has content type %s",
      "schema.chart.attr.subtitle" : "Chart subtitle",
      "text.report.availability.LT30" : "Filter events with a status duration less than 30 minutes.",
      "nav.sub.contactgroup_settings" : "Contact group settings",
      "schema.dependency.text.workflow_from_host" : "From host",
      "schema.service.text.delete" : "Delete service",
      "text.report.availability.h13" : "13:00 - 13:59",
      "word.Settings" : "Settings",
      "schema.service.desc.rotate_check_type_title" : "Rotate checkpoints",
      "err-700" : "Please change your password!",
      "schema.service.desc.service_name" : "This is the display name of the service.",
      "text.dashboard.double_click_or_mouse_wheel_to_zoom" : "Double click or use the mouse wheel to zoom in and out.",
      "site.help.doc.web-transactions" : "Web-Transactions",
      "err-634" : "For the parameter sort_type only \"asc\" or \"desc\" is allowed as value.",
      "text.dashboard.choose_content_box" : "Select a dashlet",
      "schema.service.info.notification" : "Notifications are disabled of the service.",
      "schema.service.desc.mail_soft_interval" : "This is the notification interval for emails. As long as the service is not OK you will be re-notified in this interval.",
      "word.no" : "no",
      "site.help.doc.bloonix-webgui" : "Grundlegendes zur Bloonix-WebGUI",
      "action.genstr" : "Generate string",
      "schema.host.desc.password" : "This password is used by the Bloonix Agents. If an agent wants to connect to the Bloonix server to deliver host statistics then this is only possible if the agent knows the host id and the password.",
      "schema.event.text.list" : "Events of host %s",
      "info.create_success" : "The creation was successful!",
      "schema.host.text.delete" : "Delete host",
      "schema.service.info.host_alive_check" : "This is a host-alive-check.",
      "action.clear" : "Clear",
      "schema.service.attr.last_mail" : "Last notification per mail",
      "schema.dependency.text.host" : "Host",
      "action.operate_as" : "React as",
      "schema.user.desc.password" : "Enter the users login password.",
      "schema.contactgroup.desc.description" : "Set a short description for the group.",
      "schema.contact.desc.sms_notification_level" : "Select the status level for which you want to receive notifications.",
      "site.help.doc.add-new-service" : "Einen neuen Service anlegen",
      "schema.group.text.add_user" : "Add a user to the group",
      "schema.service.info.is_volatile" : "The service is in volatile status.",
      "schema.company.attr.phone" : "Phone",
      "text.dashboard.replace_dashlet" : "Replace the dashlet",
      "schema.hs_downtime.attr.end_time" : "End time",
      "schema.host.desc.ipaddr" : "This is the main IP address of the host.",
      "text.report.availability.flapping" : "Flapping",
      "text.inherited_from_host" : "Inherited from the host",
      "schema.contactgroup.desc.name" : "This is the name of the contact group. The name should be unique.",
      "schema.service.attr.volatile_status" : "The current volatile status of the service",
      "schema.host.desc.add_host_to_host_template" : "The host inherits all services from the host template.",
      "schema.service.attr.fd_time_range" : "Flap detection time range",
      "schema.host.attr.virt_product" : "Virtualization product",
      "schema.host.text.remove_template_warning" : "Please note that all services of the template will be removed from all hosts that has its services inherited from this template!",
      "word.Timeslice" : "Timeslice",
      "schema.host.text.multiple_edit_info" : "Note: empty fields will be ignored!",
      "schema.user.text.current_password" : "Current password",
      "schema.dependency.text.list" : "Dependencies for host %s",
      "schema.company.attr.comment" : "Comment",
      "schema.service.attr.mail_soft_interval" : "Notification interval for mails (soft)",
      "nav.main.monitoring" : "MONITORING",
      "schema.user.text.view" : "User %s",
      "schema.host.action.enable_notifications_multiple" : "Enable notifications of the selected hosts",
      "text.fixed_checkpoint" : "Fixed checkpoint",
      "schema.user.attr.name" : "Name",
      "schema.contact.desc.sms_to" : "This is the mobil number of the contact. Event notifications will be send via SMS to this number.",
      "schema.user_chart.attr.subtitle" : "Subtitle",
      "schema.dependency.text.host_to_service" : "host to service",
      "schema.group.text.host_nonmembers" : "Non group members",
      "text.report.availability.EV-LT60" : "Number of events with a status duration less than 60 minutes.",
      "schema.host.attr.description" : "Description",
      "schema.service.text.services" : "Services",
      "site.wtrm.command.doSubmit" : "Submit form <b>%s</b>",
      "text.report.availability.LT180" : "Filter events with a status duration less than 3 hours.",
      "text.report.title.number_of_events_by_tags" : "Number of events by tags",
      "word.minutes" : "minutes",
      "schema.hs_downtime.text.preset" : "Preset",
      "text.report.availability.EV-LT300" : "Number of events with a status duration less than 5 hours.",
      "site.wtrm.command.checkIfElementHasNotHTML" : "Check if the element <b>%s</b> does <i>NOT</i> contain <b>%s</b>",
      "schema.service.attr.fd_flap_count" : "Notifiy after X status switches",
      "site.wtrm.command.checkIfElementNotExists" : "Check if the element <b>%s</b> does <i>NOT</i> exists",
      "text.dashboard.delete_dashboard" : "Delete the dashboard",
      "schema.service.text.failover_location_check_button" : "Failover check",
      "text.change_your_password" : "Change your password",
      "schema.host.desc.location" : "e.g. New York, Datacenter 3, Room 6, Rack A29",
      "schema.user_chart.desc.title" : "The title of the chart.",
      "text.plugin_info" : "Plugin information",
      "schema.service.attr.sms_ok" : "Send OK notifications per SMS",
      "schema.host_template.text.view" : "Template %s",
      "nav.main.administration" : "ADMINISTRATION",
      "schema.host_template.test.host_nonmembers" : "Hosts not in group",
      "schema.host.attr.active" : "Active",
      "site.help.doc.bloonix-agent-installation" : "Den Bloonix-Agenten installieren",
      "site.wtrm.text.service_report" : "Web transaction report for service %s",
      "action.list" : "List",
      "schema.roster.attr.description" : "Description",
      "schema.group.text.selected_hosts" : "Selected hosts",
      "schema.dependency.text.depends_on_service" : "depends on service",
      "schema.group.text.host_members" : "Group members",
      "nav.sub.host_group_settings" : "Host group settings",
      "schema.host.desc.device_class" : "e.g.<br/>/Server/Linux/Debian<br/>/Server/Windows/Windows 2008<br/>/Network/Router<br/>/Network/Switch<br/>/Printer",
      "text.report.title.total_availability" : "The total service availability",
      "action.extsearch" : "Extended search",
      "schema.user_chart.desc.description" : "Description of the chart.",
      "word.To" : "To",
      "schema.service.info.acknowledged" : "The service is acknowledged.",
      "nav.sub.contactgroup_members" : "Contacts in contact group",
      "schema.service.text.choose_plugin" : "Select a plugin",
      "site.wtrm.action.checkIfElementExists" : "Check if an <b>element exists</b>",
      "schema.user.desc.select_language" : "Please note that the complete WebGUI is reloaded after the language were selected and you will be redirected to the dashboard!",
      "site.login.username" : "Email address",
      "schema.contact.attr.sms_notification_level" : "SMS notification level",
      "schema.chart.attr.chart_size" : "Size",
      "schema.user.desc.authentication_key" : "With this key it's possible to visit the notification screen without password authentification. The query string to visit the notification screen looks like<br/><br/><b>/screen/?username=XXX;authkey=XXX</b>",
      "schema.host.desc.notification" : "Enable or disable the notifications of all services.",
      "text.dashboard.add_new_dashlet" : "Add a new dashlet",
      "word.Filter" : "Filter",
      "site.help.doc.the-agent-id" : "Standort-Checks im Detail",
      "schema.service.attr.attempt_warn2crit" : "Switch WARNING to CRITICAL",
      "schema.hs_downtime.attr.begin_time" : "Begin time",
      "site.wtrm.action.doUrl" : "Go to <b>URL</b>",
      "text.report.availability.h16" : "16:00 - 16:59",
      "schema.dependency.text.workflow_from_service" : "and from service",
      "schema.chart.text.safe_view" : "Safe view",
      "schema.chart.text.user_charts" : "User charts",
      "schema.service.text.create" : "Create a new service",
      "site.wtrm.attr.password" : "Password",
      "site.wtrm.attr.text" : "Inner text",
      "schema.company.attr.zipcode" : "Zipcode",
      "site.login.login" : "Please login with your username and password:",
      "schema.service.action.acknowledge_multiple" : "Acknowledge the status of the selected services",
      "schema.service.attr.status" : "Status",
      "schema.company.text.delete" : "Delete company",
      "schema.user.desc.manage_templates" : "Is the user allowed to manage host templates?",
      "site.login.request_failed" : "You request was not successful. Please try it again.",
      "action.edit" : "Edit",
      "schema.user.attr.allow_from" : "Allow from IP",
      "schema.host.desc.timeout" : "This is the timeout of all services of the host. If the status of a service is not updated in this time then a critical status is set for the services with the information that it seems that the Bloonix agent is not working.",
      "site.login.title" : "Login to the monitoring system",
      "site.wtrm.attr.element" : "Element",
      "schema.service.attr.next_check" : "Next check",
      "site.wtrm.action.checkIfElementHasNotText" : "Check if an <b>element does <i>NOT</i></b> contain <b>text</b>",
      "schema.host.text.add_host_to_contactgroup" : "Add the host to a contact group",
      "site.help.doc.contacts-and-notifications" : "Kontakte und Benachrichtigungen",
      "schema.service.desc.mail_hard_interval" : "With this option you can define a hard interval for email notifications. Even if the status switched from CRITICAL to OK and then back to CRITICAL you will not get an notification until the interval expires.",
      "schema.group.text.remove_user" : "Remove user from group",
      "site.wtrm.desc.ms" : "This is the time in milliseconds to sleep between actions.",
      "schema.plugin_stats.text.list" : "Metrics of plugin %s",
      "schema.service.info.active" : "The service is not active.",
      "schema.group.desc.groupname" : "This is the group name. The group name should be unique.",
      "text.dashboard.services_flapping" : "Flapping",
      "schema.service.attr.attempt_counter" : "Attempt counter",
      "schema.dependency.text.create" : "Create a new dependency for host <b>%s</b>",
      "site.login.want_to_login" : "Do you want to login?",
      "text.dashboard.open_dashboard" : "Open a dashboard",
      "schema.service.desc.passive_check" : "A passive check is a check which is not checked by Bloonix itself, but by a external service or script. Passive checks has no timeout and are very useful, for example, for SNMP traps. The external service has to report a critical state to the Bloonix-Agent, which in turn reports the state to the Bloonix-Server.",
      "action.cancel" : "Cancel",
      "schema.contactgroup.text.create" : "Create a new contact group",
      "schema.dependency.text.workflow_to_host" : "to host",
      "err-605" : "Please select at least one object!",
      "schema.company.attr.alt_company_id" : "Real company ID",
      "text.report.title.no_data" : "For the following services are no data available in this time range",
      "schema.timeperiod.text.delete" : "Delete timeperiod",
      "text.from_now_to_1h" : "From now + 1 hour",
      "schema.host_template.desc.description" : "Set a short description for the template.",
      "schema.contact.desc.mail_to" : "This is the email address of the contact. Event notifications will be send to this address.",
      "schema.service.desc.multiple_check_type" : "With this option it's possible to select\nmultiple checkpoints from which the service is checked. If 3 checkpoints\nreturns a critical status then the counter of <i>attempt max</i> is increased.",
      "site.wtrm.placeholder.value" : "value",
      "schema.host.attr.device_class" : "Device class",
      "site.help.doc.notification-screen" : "Notification Screen",
      "schema.chart.text.service_charts" : "Service charts",
      "action.update" : "Update",
      "schema.company.attr.max_services" : "Max services",
      "schema.group.attr.company_id" : "Company ID",
      "site.wtrm.action.checkIfElementHasNotHTML" : "Check if an <b>element does <i>NOT</i></b> contain <b>HTML</b>",
      "schema.host.attr.timeout" : "Timeout",
      "schema.timeperiod.examples" : "<p><b>Syntax: DAY-RANGE TIME-RANGE</b></p></br>\n<pre>\nDAY RANGE                       EXAMPLES\n------------------------------------------------------------\nWeekday                         Monday\nWeekday - Weekday               Monday - Friday\nMonth                           Januar\nMonth - Month                   Januar - July\nMonth Day                       Januar 1\nMonth Day - Month Day           Januar 1 - July 15\nYear                            2010\nYear - Year                     2010 - 2012\nYYYY-MM-DD                      2010-01-01\nYYYY-MM-DD - YYYY-MM-DD         2010-01-01 - 2012-06-15\n</pre></br>\n<pre>\nTIME RANGE                      EXAMPLES\n------------------------------------------------------------\nHH:MM - HH:MM                   09:00 - 17:00\nHH:MM - HH:MM, HH:MM - HH:MM    00:00 - 08:59, 17:01 - 23:59\n</pre></br>\n<p><b>Examples:</b></p></br>\n<pre>\nMonday - Friday     09:00 - 17:00\nMonday - Friday     00:00 - 08:59, 17:01 - 23:59\nSaturday - Sunday   00:00 - 23:59\n</pre></br>",
      "schema.service_downtime.text.title" : "Scheduled service downtimes for host %s",
      "nav.sub.rosters" : "Rosters",
      "schema.dependency.text.no_dependencies" : "There are no dependencies configured!",
      "schema.event.attr.duration" : "Duration",
      "schema.contact.text.settings" : "Contact settings",
      "text.report.availability.h11" : "11:00 - 11:59",
      "text.report.availability.lt300" : "Between 3 and 5 hours",
      "schema.service.text.view_location_report" : "View location report",
      "site.wtrm.attr.parent" : "Parent ID",
      "schema.chart.attr.to" : "To",
      "schema.group.text.list" : "Overview of all groups",
      "site.login.forgot_password" : "Forgot your password?",
      "schema.service.text.command_options" : "Check settings",
      "schema.host.text.list" : "Overview of all hosts",
      "schema.user.desc.company" : "Select the company the user belongs to.",
      "site.login.sign_up" : "Sign up for a Bloonix account",
      "err-425" : "Your session token is expired!",
      "schema.timeslice.attr.id" : "Timeslice ID",
      "text.report.availability.h21" : "21:00 - 21:59",
      "schema.dependency.text.workflow_from_host_status" : "Select the status of the host that activates the dependency flow",
      "schema.sms_send.text.list" : "Sent SMS for host %s",
      "schema.service.desc.sms_hard_interval" : "With this option you can define a hard interval for SMS notifications. Even if the status switched from CRITICAL to OK and then back to CRITICAL you will not get an notification until the interval expires.",
      "schema.service.text.multiple_location_check_button" : "Multiple checks",
      "site.wtrm.action.doAuth" : "Set auth basic <b>username</b> and <b>password</b>",
      "err-600" : "The object you requested does not exists!",
      "site.wtrm.action.doSleep" : "<b>Sleep</b> a while",
      "schema.chart.text.selected" : "selected",
      "schema.user_chart.text.delete" : "Delete chart",
      "schema.plugin.attr.plugin" : "Plugin",
      "site.login.follow" : "Follow Bloonix",
      "site.wtrm.attr.username" : "Username",
      "text.report.availability.h19" : "19:00 - 19:59",
      "schema.service.attr.sms_hard_interval" : "Notification interval for SMS (hard)",
      "schema.company.attr.address2" : "Address 2",
      "text.dashboard.map_title" : "Global host status map",
      "text.report.availability.EV-I" : "Number of events with status INFO.",
      "action.replace" : "Replace",
      "schema.contactgroup.text.list" : "Overview of all contactgroups",
      "schema.chart.text.chart_information" : "Chart information",
      "schema.event.attr.status" : "Status",
      "schema.service.desc.notification" : "This option activates or de-activates the notifications per email or SMS.",
      "site.help.doc.host-templates" : "Host Templates einrichten und verwalten",
      "schema.timeperiod.attr.name" : "Timeperiod",
      "schema.company.attr.name" : "Name",
      "schema.dependency.attr.on_host_id" : "Depends on host ID",
      "schema.service.text.title" : "Services",
      "schema.contactgroup.text.host_members" : "Hosts in group",
      "schema.service.desc.rotate_check_type" : "The rotate check has no fixed checkpoint.\nInstead of that the service check rotates over the selected checkpoints. If a check\nof one checkpoint is not OK, then the check jumps immediate to the next checkpoint.\nIf the third checkpoint still returns a status that is not OK then the counter of <i>attempt max</i>\nis increased.",
      "word.day" : "day",
      "schema.user.desc.name" : "This is the users full name.",
      "action.delete" : "Delete",
      "action.create" : "Create",
      "schema.host_template.desc.name" : "This is the name of the template.",
      "site.wtrm.placeholder.element" : "#element-id OR .class-name OR name",
      "schema.chart.text.view" : "Charts for host <b>%s</b>",
      "schema.service.text.list" : "Service details for all hosts",
      "schema.host.text.multiple_edit" : "Edit the configuration of multiple hosts",
      "text.report.title.total_status_duration" : "The total service status duration",
      "schema.contact.desc.sms_notifications_enabled" : "With this option it's possible to enable or disable event notifications via SMS.",
      "schema.service.action.activate_multiple" : "Activate the selected services",
      "schema.chart.text.charts" : "Charts",
      "site.wtrm.command.checkIfElementIsNotChecked" : "Check if the radio button or checkbox <b>%s</b> is <i>NOT</i> checked",
      "text.please_select_objects" : "Please select at least one object!",
      "schema.chart.text.multiview" : "View multiple charts",
      "text.dashboard.list_top_services" : "Overview of the top services",
      "text.min_length" : "Min length: <b>%s</b>",
      "schema.host.text.report_title" : "Report for host %s",
      "schema.group.text.settings" : "Group settings",
      "schema.service.info.inherits_from_host_template" : "This service is inherited from a host template.",
      "schema.host.attr.hostname" : "Hostname",
      "schema.group.text.may_create_services" : "May create services",
      "schema.host.attr.sysgroup" : "System group",
      "schema.dependency.text.workflow_from_service_status" : "Select the status of the service that activates the dependency flow",
      "schema.company.text.create" : "Create a new company",
      "schema.chart.attr.title" : "Chart title",
      "schema.hs_downtime.attr.id" : "ID",
      "err-417" : "You do not have enough privileges to create an object!",
      "action.schedule" : "Schedule",
      "text.report.availability.h09" : "09:00 - 09:59",
      "schema.user.attr.locked" : "Locked",
      "schema.contactgroup.text.delete" : "Delete contact group",
      "text.dashboard.default_dashboard_cannot_deleted" : "The default dashboard cannot be deleted!",
      "text.last_30d" : "Last 30 days",
      "word.No" : "No",
      "schema.hs_downtime.text.create" : "Create a scheduled downtime",
      "site.wtrm.command.checkIfElementHasHTML" : "Check if the element <b>%s</b> contains <b>%s</b>",
      "text.dashboard.safe_dashboard" : "Safe dashboard",
      "schema.service.attr.result" : "Advanced status information",
      "schema.host.desc.hw_manufacturer" : "e.g. IBM, HP, Dell, Fujitsu Siemens",
      "schema.company.attr.surname" : "Surname",
      "schema.user.desc.locked" : "Lock or unlock the user. Locked users cannot login to the monitoring interface.",
      "schema.contactgroup.attr.name" : "Name",
      "word.Relative" : "Relative",
      "schema.chart.text.load_view" : "Load view",
      "err-703" : "The new password is to short (min 8 signs)!",
      "site.wtrm.action.doFill" : "Fill data into a <b>input</b> field or <b>textarea</b>",
      "schema.host.desc.max_sms" : "In this field you can define the maximum number of SMS that can be send per month.",
      "text.dashboard.services_acknowledged" : "Acknowledged",
      "schema.service.desc.mail_warnings" : "This option enables or disables notifications if the service is in status WARNING.",
      "site.wtrm.placeholder.html" : "<span>Loren ipsum...</span>",
      "schema.service.text.multiple_acknowledge" : "Acknowledge or clear acknowledgements of multiple services",
      "schema.service.desc.sms_soft_interval" : "This is the notification interval for SMS. If a service is in a non OK status then you will be re-notified after this time if the service doesn't change to status OK.",
      "site.wtrm.placeholder.password" : "Secret",
      "schema.host.attr.hw_manufacturer" : "HW manufacturer",
      "schema.contact.text.escalation_level_event.x" : "active after <b>%s</b> notifications",
      "schema.service.desc.description" : "This is a short description of the check.",
      "schema.user_chart.attr.title" : "Title",
      "schema.user.desc.phone" : "The phone number can be very helpful for colleagues or the Bloonix support in emergency situations.",
      "site.help.doc.bloonix-agent-configuration" : "Den Bloonix-Agenten konfigurieren",
      "schema.dependency.attr.on_status" : "Parent status",
      "nav.sub.templates" : "Templates",
      "text.report.availability.lt30" : "Between 15 and 30 minutes",
      "schema.contactgroup.text.settings" : "Contact group settings",
      "site.help.doc.add-new-host" : "Einen neuen Host anlegen",
      "schema.host.action.add_template" : "Add template",
      "schema.hs_downtime.text.delete" : "Delete a scheduled downtime",
      "err-419" : "You do not have enough privileges to delete the objects!",
      "text.max_length" : "Max length: <b>%s</b>",
      "nav.main.report" : "REPORT",
      "text.report.availability.h23" : "23:00 - 23:59",
      "schema.service.attr.timeout" : "Timeout",
      "site.help.title" : "Die Bloonix Hilfe",
      "schema.service.attr.flapping" : "Flapping",
      "text.dashboard.dashlet_select_chart_title" : "Select a chart for the dashlet.",
      "text.dashboard.dashlet_select_chart" : "Select a chart",
      "text.first_failover_checkpoint" : "First failover checkpoint",
      "schema.chart.text.really_delete_view" : "Do you really want to delete chart view <b><b>%s</b></b>?",
      "schema.service.desc.agent_id" : "This is the location from where the check is executed.",
      "schema.service.desc.rotate_check_type_locations" : "Your service is checked from the following checkpoints:",
      "text.dashboard.services_notification" : "Notification status of all services",
      "schema.contact.text.timeperiods" : "Contact timeperiods",
      "schema.dependency.attr.id" : "Dependency ID",
      "text.dashboard.title" : "Dashboard",
      "schema.user.attr.manage_contacts" : "Manage contacts?",
      "schema.user.text.list" : "Overview of all users",
      "schema.service.desc.mail_ok" : "This option enables or disables notifications if the service switched back to status OK.",
      "info.extended_search_syntax_for_hosts" : "<p>It's possible to filter the host list by a search query. The syntax is very simple and looks like:</p>\n<pre>key:value</pre>\n<p>The key is the table field to search for the value.</p>\n<p>Search examples:</p>\n<p>- Search for hosts in status CRITICAL or UNKNOWN</p>\n<pre>status:CRITICAL OR status:UNKNOWN</pre>\n<p>- Search for hosts in datacenter 12 with status CRITICAL</p>\n<pre>location:\"Datacenter 12\" AND status:CRITICAL</pre>\n<p>The following keys are available to search for specific fields:</p>",
      "site.wtrm.desc.text" : "The inner text of an element you wish to check.",
      "word.Yes" : "Yes",
      "word.Preset" : "Preset",
      "schema.host.text.mtr_output" : "MTR result of host %s",
      "action.quicksearch" : "Quick search",
      "schema.dependency.attr.status" : "Status",
      "schema.service.attr.ref_id" : "ID",
      "schema.group.attr.id" : "Group ID",
      "schema.chart.attr.id" : "Chart ID",
      "site.wtrm.text.wtrm_workflow" : "Web Transaction Workflow",
      "schema.host.desc.comment" : "This field can be used to set a short comment to the host.",
      "text.report.availability.agent_dead" : "Agent dead",
      "site.wtrm.desc.url" : "This is the full URL to request. As example: http://www.bloonix.de/",
      "schema.dependency.text.workflow_to_service" : "and to service",
      "schema.host.text.add_host_to_group" : "Add the host to a user group",
      "schema.host.desc.active" : "Active or de-activate the host and all services.",
      "schema.service.attr.volatile_since" : "Since the status is volatile",
      "schema.user_chart.text.create" : "Create a chart",
      "schema.host.text.device_class_help_link" : "Read how this feature works",
      "schema.user.text.session_expires" : "Session expires",
      "err-801" : "Sorry, but you cannot configure more than <b>%s</b> services!",
      "text.dashboard.top_hosts_events" : "Top events of all hosts",
      "text.report.availability.h22" : "22:00 - 22:59",
      "nav.sub.reports" : "Reports",
      "schema.chart.text.alignment" : "Chart alignment",
      "word.Absolute" : "Absolute",
      "err-704" : "The passwords doesn't match!",
      "schema.plugin.attr.categories" : "Categories",
      "schema.service.desc.agent_id_tooltip" : "<h3>From which location should the check be executed?</h3>\n<p>\nYou can choose between the options <i>localhost</i>, <i>intranet</i> and <i>remote</i>.\n</p>\n<h3>localhost</h3>\n<p>\nWith the option <i>localhost</i> the check is executed local on your server.\nFor this action it's necessary that the Bloonix-Agent is installed on your server.\nThis option is useful if you want to monitor the system vitals like the CPU,\nthe memory or the disk usage.\n</p>\n<h3>intranet</h3>\n<p>\nThe option <i>intranet</i> means your local network. If you want to monitor the service\nfrom your local network, then it's necessary that you install the Bloonix-Agent on a\ncentral server in your intranet. The checks will be executed from this server.\nThis option is useful if you want to monitor devices that has no direct internet connection\nlike router, switches and so on.\n</p>\n<h3>remote</h3>\n<p>\nWith the option <i>remote</i> the check is executed from a external Bloonix-Server. This is\nvery useful if you want to monitor your webserver, website, mailserver and other internet services.\n</p>",
      "site.login.choose_your_language" : "Select your language",
      "schema.service.desc.sms_warnings" : "This option enables or disables notifications if the service is in status WARNING.",
      "text.from_now_to_7d" : "From now + 7 days",
      "schema.host_template.text.delete_service_warning" : "Please note that the service will be deleted from all hosts that gets the service inherited from this template.",
      "schema.chart.text.selected_max_reached" : "(max) selected",
      "schema.service.text.settings" : "Settings of service <b>%s</b>",
      "site.wtrm.action.checkIfElementIsChecked" : "Check if a <b>radio button</b> or <b>checkbox</b> is <b>checked</b>",
      "site.wtrm.action.checkIfElementHasValue" : "Check the <b>value</b> of an <b>input</b> field or <b>textarea</b>",
      "schema.plugin.attr.description" : "Description",
      "schema.user_chart.text.title" : "User charts",
      "nav.sub.services" : "Services",
      "schema.sms_send.attr.time" : "Timestamp",
      "schema.dependency.text.dependencies" : "Dependencies",
      "schema.service.desc.failover_check_type_locations" : "Select a fixed and two failover checkpoints",
      "site.wtrm.desc.contentType" : "Enter content type that is expeced for the URL.",
      "action.no_abort" : "<b>No, abort!</b>",
      "text.from_now_to_4h" : "From now + 4 hours",
      "schema.service.attr.scheduled" : "Has downtime",
      "schema.host.text.multiple_activate" : "Activate or deactivate multiple hosts",
      "schema.group.attr.groupname" : "Groupname",
      "action.members" : "List members",
      "schema.host.attr.company_id" : "Company ID",
      "word.active" : "active",
      "schema.host.attr.comment" : "Comment",
      "schema.service.desc.timeout" : "This is the timeout of the service. If the status of the service is not updated in this time then a critical status is set for the service with the information that it seems that the Bloonix agent is not working. If no value is set, then the timeout of the host is inherited.",
      "schema.user.attr.comment" : "Comment",
      "err-633" : "The parameter sort_by must begin with a character of a-z and only characters from a-z, 0-9 and a underscore are allowed. The max length is 63 characters.",
      "schema.contactgroup.text.selected_hosts" : "Selected hosts",
      "schema.user.desc.allow_from" : "It's possible to set a comma separated list of ip addresses from which the user is restricted to login. With the keyword <i>all</i> the login has no restriction.",
      "schema.contact.desc.mail_notifications_enabled" : "With this option it's possible to enable or disable event notifications via email.",
      "schema.company.desc.max_services" : "The max amount of services this company is allowed to monitor. Set 0 (null) if unlimited.",
      "schema.user.attr.role" : "Role",
      "site.wtrm.command.doWaitForElement" : "Wait for element <b>%s</b>",
      "text.locations_selected_costs" : "You have <b>%s</b> checkpoints selected. Please note that each checkpoint will be charged extra.",
      "site.login.documentation" : "The Bloonix documentation",
      "text.report.availability.h02" : "02:00 - 02:59",
      "schema.chart.text.select" : "Chart selection for host %s",
      "site.wtrm.attr.html" : "Inner HTML",
      "schema.host.text.list_device_classes" : "Device classes",
      "schema.host_template.text.delete_service" : "Delete a service from the template",
      "schema.service.desc.volatile_retain" : "Set a time after the volatile status is automatically cleared.",
      "schema.service.attr.last_sms_time" : "Last notification per SMS",
      "word.hours" : "hours",
      "schema.host.desc.add_host_to_contactgroup" : "Add the host to a contact group to get event notifications via email or sms.",
      "schema.timeperiod.text.examples" : "Timeperiod examples",
      "schema.dependency.attr.timeslice" : "Timeslice",
      "schema.host_template.text.list" : "Overview of all host templates",
      "word.days" : "days",
      "schema.service.attr.is_volatile" : "Is the service volatile",
      "info.go-back" : "Go back",
      "err-405" : "Your session is expired!",
      "word.debug" : "Debug",
      "schema.service.attr.last_event" : "Last event",
      "schema.hs_downtime.text.select_services" : "Services<br/><small>Do not select any servives if you want to<br/>create a downtime for the complete host.</small>",
      "err-418" : "You do not have enough privileges to modify the objects!",
      "text.report.availability.LT15" : "Filter events with a status duration less than 15 minutes.",
      "schema.service.desc.acknowledged" : "This option is useful if a service is not OK and if you want to disable the notifications temporary. The notifications will be enabled again if the services switched to the status OK.",
      "site.wtrm.desc.username" : "This username for the auth basic authentification.",
      "nav.sub.mtr" : "MTR",
      "text.report.availability.h14" : "14:00 - 14:59",
      "site.wtrm.desc.value" : "The value of the element you wish to fill or check.",
      "schema.contact.attr.mail_notification_level" : "Mail notification level",
      "text.report.availability.ge300" : "Longer than 3 hours",
      "nav.sub.screen" : "Screen",
      "schema.service.text.multiple_notification" : "Enable or disable the notifications of multiple services",
      "site.help.doc.host-and-service-dependencies" : "Abhängigkeiten zwischen Hosts und Services",
      "action.view_selected_objects" : "View selected objects",
      "site.wtrm.command.doSelect" : "Select the value <b>%s</b> from the selectbox <b>%s</b>",
      "schema.dependency.text.workflow_to_service_status" : "Select the status of the parent service that avoids a notification",
      "schema.user_chart.text.update" : "Update a chart",
      "schema.roster.text.list" : "Overview of all rosters",
      "schema.service.text.view_wtrm_report" : "View web transaction report",
      "err-800" : "Sorry, but you cannot configure more than <b>%s</b> service!",
      "site.help.doc.device-classes" : "Bauklasse von Hosts",
      "schema.user.attr.manage_templates" : "Manage templates?",
      "text.dashboard.hosts_availability" : "Availability of all hosts",
      "schema.service.attr.comment" : "Comment",
      "schema.service.info.has_result" : "This service check has advanced status information. Click me :-)",
      "schema.user.text.new_password" : "New password",
      "text.dashboard.services_downtimes" : "Downtimes",
      "schema.service.info.flapping" : "The service is flapping.",
      "text.last_60d" : "Last 60 days",
      "site.help.doc.host-alive-check" : "Was ist ein Host-Alive-Check?",
      "schema.contact.text.escalation_level_event.1" : "active after 1 notification",
      "action.close" : "Close",
      "schema.roster.attr.roster" : "Roster",
      "schema.user_chart.desc.yaxis_label" : "The label of the Y-axis.",
      "schema.company.attr.company" : "Company",
      "site.wtrm.command.doUserAgent" : "Set the user agent to <b>%s</b>",
      "schema.host.action.deactivate_multiple" : "Deactivate the selected hosts",
      "text.report.availability.Service" : "Click on the service to get a detailed availabilty report.",
      "action.yes_delete" : "<b>Yes, delete!</b>",
      "schema.contact.attr.id" : "Contact ID",
      "schema.service.attr.command" : "Command",
      "action.help" : "Help",
      "schema.event.text.host_service" : "Host / Service",
      "nav.sub.hosts" : "Hosts",
      "site.help.doc.json-api" : "Die Bloonix JSON API",
      "nav.main.notifications" : "NOTIFICATIONS",
      "schema.contact.attr.mail_to" : "E-Mail",
      "schema.host_template.text.create" : "Create a new template",
      "schema.chart.attr.preset_last" : "Preset: last",
      "schema.event.attr.tags" : "Tags",
      "site.help.doc.scheduled-downtimes" : "Geplante Wartungsarbeiten einrichten",
      "schema.user.attr.timezone" : "Timezone",
      "action.display_from_to_rows" : "Displaying <b>%s</b>-<b>%s</b> of <b>%s</b> hits",
      "schema.contactgroup.attr.description" : "Description",
      "site.wtrm.placeholder.ms" : "5000",
      "word.inactive" : "inactive",
      "site.wtrm.desc.hidden" : "Do you want to hide the value because it's a password or a secret string?",
      "schema.user.text.select_language" : "Select your preferred language",
      "site.login.welcome" : "Welcome to Bloonix! Please log in.",
      "schema.host_template.text.clone_title" : "Clone template %s",
      "text.report.availability.h17" : "17:00 - 17:59",
      "schema.host.info.inactive" : "The host is not active.",
      "schema.service.attr.interval" : "Interval",
      "schema.service.action.multiple_force_next_check" : "Force the next check",
      "schema.service.info.inactive" : "The service is inactive.",
      "schema.user.text.delete" : "Delete user",
      "schema.service.text.select_location_check_type_info" : "Click on the buttons to see a short description of each type",
      "schema.service.attr.notification" : "Notifications enabled",
      "site.wtrm.attr.userAgent" : "User-Agent",
      "schema.service.desc.failover_check_type_title" : "Failover checkpoints",
      "schema.service.attr.sms_soft_interval" : "Notification interval for SMS (soft)",
      "schema.user_chart.desc.subtitle" : "The title of the chart.",
      "site.wtrm.command.doFill" : "Fill element <b>%s</b> with value <b>%s</b>",
      "schema.host.desc.coordinates" : "Select the location of the host by country code.",
      "site.wtrm.action.checkIfElementIsSelected" : "Check if a <b>value</b> is <b>selected</b> in a selectbox",
      "text.undefined" : "Undefined",
      "info.search_syntax" : "<p><b>Search syntax:</b></p>\n<p>planet <i>AND</i> mars</p>\n<p>mars <i>OR</i> pluto</p>\n<p>planet <i>AND</i> mars <i>OR</i> pluto</p>",
      "schema.user.attr.authentication_key" : "Authentication key",
      "word.Days" : "Days",
      "text.never" : "Never",
      "text.report.availability.AV-W" : "Time slice in percent in which the service was in status WARNING.",
      "schema.chart.text.chart_views" : "Chart views",
      "schema.service.desc.active" : "This option activates or de-activates the service check.",
      "schema.service.attr.command_options" : "Check settings",
      "schema.hs_downtime.attr.username" : "Added by",
      "text.selected_objects" : "Selected objects",
      "schema.dependency.text.service_to_service" : "service to service",
      "schema.service.action.deactivate_multiple" : "Deactivate the selected services",
      "word.Hours" : "Hours"
   },
   "de" : {
      "site.wtrm.attr.url" : "URL",
      "info.update_success" : "Das Upate war erfolgreich!",
      "schema.service.action.enable_notifications_multiple" : "Benachrichtigungen einschalten für die selektierten Services",
      "schema.user_chart.text.editor" : "Benutzer Chart Editor",
      "schema.host_template.attr.description" : "Beschreibung",
      "schema.user.desc.timezone" : "Wähle die Zeitzone des Benutzers.",
      "schema.host.text.templates_not_assigned" : "Nicht zugeordnete Templates",
      "word.yes" : "ja",
      "schema.timeperiod.text.settings" : "Einstellungen des Zeitplans",
      "schema.plugin_stats.attr.description" : "Beschreibung",
      "schema.service.text.multiple_help" : "<h4>Diese Aktion erfordert, dass mindestens ein Service ausgewählt ist.</h4>\nUm einen einzelnen Service zu markieren, klicken Sie auf die entsprechende Zeile.\nWenn Sie mehrere Services markieren möchten, halten Sie einfach die Taste <i>STRG</i>\nauf Ihrer Tastatur gedrückt. Beim Drücken und Halten der <i>SHIFT</i>-Taste kann ein\ngrößerer Bereich von Hosts gewählt werden.",
      "text.report.availability.timeout" : "Timeout",
      "word.From" : "Von",
      "text.from_now_to_2h" : "Von jetzt + 2 Stunden",
      "site.login.error" : "Einloggen fehlgeschlagen! Versuchen Sie es erneut!",
      "schema.chart.desc.charts" : "<b>Mehrere Charts können ausgewählt werden mittels</b><br/><br/>\n<i>STRG+Klick</i><br/>oder<br/><i>SHIFT+Klick</i>",
      "nav.main.dashboard" : "DASHBOARD",
      "site.login.request_success" : "Ihre Anfrage wurde erfolgreich zugestellt.<br/>\nEin Administrator wird Sie so schnell wie möglich kontaktieren.",
      "schema.contact.desc.company_id" : "Wähle ein Unternehmen zu dem der Kontakt gehört",
      "schema.host.action.disable_notifications_multiple" : "Benachrichtigungen ausschalten für die selektierten Hosts",
      "text.dashboard.user_chart" : "Selbst erstellter Chart",
      "schema.user.attr.phone" : "Telefon",
      "schema.contactgroup.attr.id" : "Kontaktgruppen ID",
      "schema.dependency.text.workflow_timezone" : "Gebe eine Zeitzone für den Zeitabschnitt an",
      "site.login.request_password" : "Fordern Sie ein neues Passwort an.",
      "schema.service.attr.message" : "Status Informationen",
      "schema.service.attr.sms_warnings" : "Benachrichtigungen für Warnmeldungen per SMS versenden",
      "schema.group.text.create" : "Eine neue Gruppe erstellen",
      "schema.host.desc.company_id" : "Wähle ein Unternehmen zu dem der Host gehört",
      "schema.contact.text.delete" : "Kontakt löschen",
      "schema.service.attr.last_sms" : "Letzte Benachrichtigung per SMS",
      "schema.host.attr.hw_product" : "HW Produkt",
      "schema.host.desc.status" : "Der Status des Hosts. Mögliche Werte sind OK, INFO, WARNING, CRITICAL oder UNKNOWN.",
      "schema.host.attr.os_product" : "OS Produkt",
      "schema.service.desc.fd_enabled" : "Diese Option aktiviert oder deaktiviert die Erkennung von zu häufigen Statuswechseln (Flap Detection). Wenn ein Service zu häufig in einem kurzen Zeitraum den Status wechselt, ohne das der Prüfzähler für die maximale Anzahl erlaubter Fehlschläge erreicht wird, so greift diese Funtion. Für die Erkennung wird die Anzahl von Statuswechseln in einem bestimmten Zeitraum gemessen. Wenn der Status in diesem Zeitraum zu häufig wechselte, wird ein kritisches Ereignis ausgelöst.",
      "schema.timeslice.attr.timeslice" : "Zeitabschnitt",
      "action.overview" : "Übersicht",
      "text.change_the_language" : "Ändere die Sprache",
      "schema.dependency.text.workflow_to_host_status" : "Wähle den Status des übergeordneten Hosts, welcher die Benachrichtigung untertrückt",
      "schema.user_chart.text.add_metric" : "Metrik hinzufügen",
      "text.thresholds" : "Schwellwerte",
      "schema.plugin_stats.attr.statkey" : "Schlüssel",
      "site.wtrm.command.checkIfElementIsChecked" : "Check if the radio button or checkbox <b>%s</b> is checked",
      "text.last_180d" : "Die letzten 180 Tage",
      "text.report.availability.h03" : "03:00 - 03:59",
      "site.wtrm.command.checkIfElementHasNotText" : "Check if the element <b>%s</b> does <i>NOT</i> contain <b>%s</b>",
      "schema.service.attr.last_check" : "Letzte Prüfung",
      "schema.host_template.attr.name" : "Template Name",
      "nav.sub.contacts" : "Kontakte",
      "text.report.availability.detailed_report_onclick" : "Klicke auf einen Service für einen detaillierten Bericht",
      "schema.service.desc.multiple_check_type_locations" : "Bitte wählen Sie mindestens 3 Messpunkte aus:",
      "word.Hosts" : "Hosts",
      "schema.contact.text.escalation_level_event.0" : "Permanent aktiv",
      "site.wtrm.attr.contentType" : "Content-Type",
      "schema.host.text.multiple_notification" : "Die Benachrichtigungen für mehrere Hosts ein- oder ausschalten",
      "schema.host_downtime.text.title" : "Geplante Wartungsarbeiten für Host %s",
      "schema.sms_send.attr.message" : "Nachricht",
      "schema.company.attr.city" : "Stadt",
      "schema.service.desc.attempt_max" : "Diese Option kontrolliert, wann Sie eine Benachrichtiung erhalten, wenn ein Service nicht OK ist. Ein Wert von 3 bedeuted zum Beispiel, dass eine Serviceprüfung 3 Mal hintereinander fehlschlagen darf, bis Sie eine Benachrichtigung erhalten.",
      "site.help.doc.host-variables" : "Host Variablen",
      "nav.sub.downtimes" : "Wartungsarbeiten",
      "schema.dependency.text.workflow_timeslice" : "Gebe einen Zeitabschnitt an, in dem die Abhängigkeit aktiv ist",
      "text.report.title.host_from_to" : "Bericht für Host %s von %s bis %s",
      "schema.group.text.delete" : "Die Gruppe löschen",
      "schema.dependency.attr.on_service_id" : "Depends on service ID",
      "schema.host.attr.sysinfo" : "System Informationen",
      "schema.host.attr.location" : "Standort",
      "schema.timeperiod.attr.id" : "Zeitplan ID",
      "schema.user.text.password_update" : "Bitte gebe ein neues Passwort ein.",
      "text.report.availability.AV-I" : "Der Zeitbereich in Prozent in dem der Service im Status INFO war.",
      "schema.contact.attr.name" : "Name",
      "site.wtrm.action.doUncheck" : "Uncheck a <b>radio button</b> or <b>checkbox</b>",
      "schema.user.attr.password_changed" : "Wurde das Passwort geändert?",
      "schema.timeslice.text.list" : "Übersicht über alle Zeitabschnitte",
      "text.report.availability.lt15" : "Zwischen 0 und 15 Minuten",
      "word.Language" : "Sprache",
      "schema.host.attr.os_manufacturer" : "OS Hersteller",
      "schema.user_chart.text.chart_metrics" : "Chart Metriken",
      "site.wtrm.placeholder.contentType" : "text/html",
      "site.wtrm.command.checkUrl" : "Check if the URL in the address bar is <b>%s</b>",
      "err-701" : "Das Passwort ist ungültig!",
      "schema.company.text.list" : "Übersicht über alle Unternehmen",
      "schema.host.info.notification_disabled" : "Benachrichtigungen sind für diesen Host ausgeschaltet",
      "schema.event.attr.last_status" : "Letzter Status",
      "nav.sub.notifications" : "Benachrichtigungen",
      "site.wtrm.command.checkIfElementIsNotSelected" : "Check if the value <b>%s</b> of the selectbox <b>%s</b> is <i>NOT</i> selected",
      "schema.contact.text.timeperiod_type_send_only_mail" : "Nur Mails versenden",
      "schema.event.text.filter_message" : "Nachrichtenfilter",
      "site.wtrm.action.checkIfElementHasNotValue" : "Check if an <b>input</b> field or <b>textarea has <i>NOT</i></b> a specified <b>value</b>",
      "schema.service.attr.attempt_max" : "Benachrichtige nach X versuchen",
      "action.submit" : "Bestätigen",
      "site.wtrm.attr.ms" : "Milliseconds",
      "err-500" : "Ein interner Fehler ist aufgetreten! Bitten kontaktieren Sie den Administrator!",
      "schema.contactgroup.text.host_nonmembers" : "Hosts, die der Kontaktgruppe nicht angehören",
      "site.wtrm.attr.value" : "Value",
      "schema.contactgroup.text.service_members" : "Services, die der Kontakgruppe angehören",
      "schema.service.attr.fd_enabled" : "Erkennung von Statuswechseln eingeschaltet",
      "schema.host.desc.interval" : "Das ist der Prüfungsintervall aller Services des Hosts.",
      "action.unselect" : "Abwählen",
      "schema.host.desc.max_services" : "Konfiguration der maximalen Services, die für diesen Host eingerichtet werden dürfen. 0 heißt unlimitiert.",
      "schema.dependency.text.service" : "Service",
      "schema.service.desc.sms_ok" : "Diese Option aktiviert oder deaktiviert das Versenden von Nachrichten per SMS für Services die in den Status OK zurückwechseln.",
      "err-705" : "Das neue und alte Passwort dürfen nicht übereinstimmen!",
      "text.dashboard.reconfigure_dashlet" : "Dashlet konfigurieren",
      "schema.company.attr.active" : "Aktiv",
      "action.remove" : "Entfernen",
      "site.wtrm.desc.html" : "The inner HTML of an element you wish to check.",
      "word.Seconds" : "Sekunden",
      "schema.contactgroup.text.service_nonmembers" : "Services, die nicht der Kontaktgruppe angehören",
      "schema.user.desc.comment" : "Dieses Feld kann für interne Kommentare über den Benutzer verwendet werden.",
      "site.wtrm.action.checkIfElementHasText" : "Check if an <b>element</b> contains <b>text</b>",
      "schema.hs_downtime.attr.timezone" : "Zeitzone",
      "schema.service.info.notification_disabled" : "Die Benachrichtigungen sind ausgeschaltet.",
      "text.from_now_to_8h" : "Von jetzt + 8 Stunden",
      "schema.service.desc.default_check_type_location" : "Der Messpunkt für Standardchecks ist:",
      "site.help.doc.host-parameter" : "Host Parameter im Detail",
      "schema.service.attr.mail_hard_interval" : "Benachrichtigungsintervall für E-Mails (hart)",
      "nav.sub.contactgroups" : "Kontaktgruppen",
      "action.refresh" : "Aktualisieren",
      "info.no_chart_data" : "Es sind keine Chartdaten verfügbar.",
      "text.report.availability.h12" : "12:00 - 12:59",
      "site.wtrm.command.checkIfElementExists" : "Check if the element <b>%s</b> exists",
      "schema.chart.text.chart_type" : "Wähle den Charttyp",
      "text.report.availability.EV-U" : "Anzahl von Ereignissen mit Status UNKNOWN. ",
      "schema.service.attr.id" : "Service ID",
      "schema.service.desc.default_check_type" : "Standard-Checks haben einen vordefinierten Messpunkt. Von diesem Messpunkt aus wird Ihr Service geprüft. Der Messpunkt für Standardchecks ist:",
      "text.report.availability.EV-LT180" : "Anzahl von Ereignissen mit einer Statusdauer kleiner als 3 Stunden. ",
      "bool.yesno.1" : "Ja",
      "schema.host.attr.interval" : "Intervall",
      "schema.service.text.multiple_downtimes" : "Eine geplante Wartungsarbeit für mehrere Services einrichten",
      "site.help.doc.service-parameter" : "Service Parameter im Detail",
      "schema.service.desc.interval" : "Das ist der Prüfungsintervall des Service. Wenn kein Wert gesetzt ist, dann wird der Intervall des Hosts vererbt.",
      "site.wtrm.desc.element" : "The element you want to select. As example: #id, .class, name",
      "schema.user_chart.attr.yaxis_label" : "Label der Y-Achse",
      "action.view" : "Einsehen",
      "word.Minutes" : "Minuten",
      "text.option_examples" : "Optionen und Beispiele",
      "schema.host_template.text.setting" : "Einstellungen des Template",
      "schema.contact.text.create" : "Erstelle einen neuen Kontakt",
      "schema.chart.attr.from" : "Von",
      "text.last_90d" : "Die letzten 90 Tage",
      "text.report.availability.EV-LT30" : "Anzahl von Ereignissen mit einer Statusdauer kleiner als 30 Minuten. ",
      "schema.dependency.text.for_node" : "Abhängigkeiten für Knoten %s",
      "text.report.availability.Events" : "Totale Anzahl von Ereignissen.",
      "schema.user.desc.password_changed" : "Setzen Sie den Wert auf <i>Nein</i> wenn Sie den Benutzer auffordern möchten sein Passwort nach dem ersten Login zu ändern.",
      "schema.host_template.text.view_members" : "Hosts hinzufügen / entfernen",
      "schema.host.desc.add_host_to_group" : "Füge den Host einer Gruppe hinzu.",
      "schema.plugin.text.list" : "Plugins",
      "site.wtrm.text.click_for_details" : "Click on a row to get a detailed report",
      "schema.service.text.select_location_check_type" : "Wähle den Typ des Checks",
      "err-601" : "Die angeforderten Objekte existieren nicht!",
      "err-420" : "Die Aktion ist fehlgeschlagen!",
      "schema.service.desc.send_sms" : "Diese Option aktiviert oder deaktiviert das Versenden von SMS für diesen Service.",
      "text.unlimited" : "Unbegrenzt",
      "schema.chart.attr.preset" : "Vorauswahl",
      "site.wtrm.command.doUrl" : "Go to URL <b>%s</b>",
      "schema.event.attr.time" : "Zeitstempel",
      "schema.host.text.create" : "Einen neuen Host erstellen",
      "site.wtrm.action.doClick" : "<b>Click</b> on a element",
      "text.chart_info" : "Chart Informationen",
      "schema.group.text.may_modify_services" : "Darf Services ändern",
      "schema.user_chart.attr.description" : "Beschreibung",
      "schema.contact.desc.name" : "Dies ist der volle Name des Kontakts.",
      "schema.service.action.disable_notifications_multiple" : "Benachrichtigungen ausschalten für die selektierten Services",
      "action.redirect" : "Umleiten",
      "schema.host.action.remove_template" : "Template entfernen",
      "text.dashboard.use_mouse_wheel_to_zoom" : "Nutze das Mausrad um zu Zoomen",
      "schema.host.attr.password" : "Passwort",
      "schema.sms_send.attr.send_to" : "Empfänger",
      "text.dashboard.name" : "Name des Dashboards",
      "schema.timeperiod.desc.description" : "Dies ist eine kurze Beschreibung zum Zeitplan.",
      "site.wtrm.attr.hidden" : "Hide",
      "text.report.availability.AV-C" : "Der Zeitbereich in Prozent in dem der Service im Status CRITICAL war.",
      "err-416" : "Sie haben nicht genügend Rechte für diese Operation!",
      "schema.chart.attr.charts" : "Charts",
      "schema.company.attr.country" : "Land",
      "schema.host.desc.os_manufacturer" : "z.B. Red Hat, Microsoft, CISCO",
      "site.wtrm.action.doSubmit" : "<b>Submit</b> a form",
      "site.wtrm.command.doSleep" : "Sleep <b>%s</b>ms",
      "schema.roster.attr.id" : "Bereitschaftsplan ID",
      "schema.host.attr.status" : "Status",
      "site.wtrm.action.doSelect" : "<b>Select</b> a value from a selectbox",
      "schema.host.text.mtr_chart" : "MTR Chart",
      "schema.service.text.sla_requirements" : "Bitte beachten Sie das für freie Accounts nur der Standardcheck zur Verfügung steht!",
      "action.abort" : "Abbrechen",
      "text.report.availability.h08" : "08:00 - 08:59",
      "action.move_box" : "Bewege die Box",
      "schema.company.attr.fax" : "Fax",
      "schema.timeslice.text.delete" : "Den Zeitabschnitt löschen",
      "schema.contact.text.timeperiod_type_exclude" : "Exkludieren",
      "schema.service.desc.fd_time_range" : "Dies ist der Zeitbereich, in dem die Statuswechsel gemessen werden.",
      "action.login" : "Einloggen",
      "nav.sub.contactgroup_service_members" : "Services in der Kontaktgruppe",
      "schema.user.text.is_logged_in" : "Ist eingeloggt",
      "text.browsers_heap_size" : "Anzeige der Auslastung der Heap-size in Ihrem Browser",
      "text.from_now_to_4d" : "Von jetzt + 4 Tage",
      "site.help.doc.users-and-groups" : "Die Benutzer- und Gruppenverwaltung",
      "schema.contact.text.timeperiod_type" : "Inkludieren / Exkludieren",
      "site.wtrm.action.doUserAgent" : "Set the <b>user agent</b> for the request",
      "text.report.availability.h15" : "15:00 - 15:59",
      "nav.sub.contactgroup_host_members" : "Hosts in der Kontaktgruppe",
      "schema.hs_downtime.attr.timeslice" : "Zeitraum",
      "site.wtrm.placeholder.userAgent" : "User-Agent",
      "text.from_now_to_1d" : "Von jetzt + 1 Tag",
      "text.report.availability.AV-U" : "Der Zeitbereich in Prozent in dem der Service im Status UNKNOWN war.",
      "schema.host.attr.max_services" : "Maximal konfigurierbare Services",
      "schema.user.attr.password" : "Passwort",
      "site.wtrm.placeholder.hidden" : "Hide this value?",
      "text.report.availability.h07" : "07:00 - 07:59",
      "schema.service.text.multiple" : "Service Aktionen",
      "schema.host.attr.allow_from" : "Erlaubter Zugriff",
      "schema.host.desc.variables" : "In diesem Feld können Host Variablen definiert werden. Diese Variablen können für Schwellwerten bei der Konfiguration von Service-Checks verwendet werden. Beispiel:<br/><br/><b>HTTP.PORT=9000</b><br/><br/>Diese Variable kann dann im Format <i>%HTTP.PORT%</i> für Schwellwerte eingesetzt werden. Bitte beachten Sie das zwei Variablen vordefiniert sind: <i>IPADDR</i> und <i>HOSTNAME</i>. Diese Variablen werden mit der IP-Adresse und dem Hostnamen ersetzt. Weitere Informationen hierzu finden Sie in der Hilfe.<br/><br/>Erlaubte Zeichen: a-z, A-Z, 0-9, Punkt und Unterstrich",
      "schema.contact.attr.mail_notifications_enabled" : "E-Mail global aktiv",
      "site.wtrm.command.doAuth" : "Use auth basic with username <b>%s</b> and password <b>%s</b>",
      "schema.host.text.list_templates" : "Host %s hat folgende Templates konfiguriert",
      "schema.host.text.multiple_downtimes" : "Eine geplante Wartungsarbeit für mehrere Hosts einrichten",
      "schema.host_template.text.clone" : "Das Template klonen",
      "site.wtrm.placeholder.text" : "Lorem ipsum...",
      "schema.host.desc.sysinfo" : "Hier können Sie einen externen Link zu Ihrer Host-Dokumentation eintragen, zum Beispiel: https://mysite.test/?id=12345.<br/><br/>Nicht erlaubte Zeichen: \"\\",
      "schema.user.attr.last_login" : "Letzter Login",
      "schema.service.attr.passive_check" : "Ist dies ein passiver Check?",
      "info.create_failed" : "Das Erstellen ist fehlgeschlagen!",
      "schema.host.attr.ipaddr" : "IP-Adresse",
      "schema.chart.text.multiple_view" : "Chart Ansicht",
      "schema.plugin.attr.info" : "Information",
      "schema.service.attr.host_alive_check" : "Ist dies ein Host-Alive-Check?",
      "schema.contact.attr.sms_notifications_enabled" : "SMS global aktiv",
      "text.report.availability.EV-LT15" : "Anzahl von Ereignissen mit einer Statusdauer kleiner als 15 Minuten.",
      "schema.plugin_stats.attr.datatype" : "Datentyp",
      "schema.timeperiod.text.list" : "Übersicht über alle Zeitpläne",
      "action.add" : "Hinzufügen",
      "action.show_selected_objects" : "Ausgewählte Objekte anzeigen",
      "schema.plugin_stats.attr.alias" : "Name",
      "nav.sub.companies" : "Unternehmen",
      "text.dashboard.dashlet_configuration" : "Dashlet Konfiguration",
      "schema.user.desc.manage_contacts" : "Darf der Benutzer Kontakte verwalten?",
      "schema.host.action.activate_multiple" : "Selektierte Hosts aktivieren",
      "text.report.availability.lt180" : "Zwischen 1 und 3 Stunden",
      "text.report.title.number_of_events_by_duration" : "Anzahl der Ereignisse nach Dauer",
      "text.report.availability.GE300" : "Filterung von Ereignissen mit einer Statusdauer größer als 5 Stunden.",
      "schema.company.attr.address1" : "Adresse 1",
      "text.report.availability.lt60" : "Zwischen 30 und 60 Minuten",
      "nav.sub.events" : "Ereignisse",
      "schema.service.action.clear_acknowledgement_multiple" : "Die Bestätigung des Status der selektierten Services aufheben",
      "site.wtrm.action.checkIfElementIsNotSelected" : "Check if a <b>value is <i>NOT</i> selected</b> in a selectbox",
      "schema.service.attr.last_mail_time" : "Letzte Benachrichtigung per E-Mail",
      "schema.service.attr.active" : "Aktiv",
      "schema.group.desc.description" : "Gebe eine kleine Beschreibung zum Unternehmen ein.",
      "schema.service.desc.host_alive_check" : "Ein Host-Alive-Check ist ein Check der feststellt, ob ein Host UP oder DOWN ist. Wenn dieser Service Check einen kritischen Status liefert erhalten Sie eine besondere Nachricht. Wenn andere Services des Hosts ebenfalls in einem kritischen Status sind, während der Host-Alive-Check kritisch ist, dann werden die Benachrichtiungen anderer Services unterdrückt. Es wird empfohlen einen Ping-Check als Host-Alive-Check zu definieren.",
      "schema.host.desc.virt_product" : "z.B. VMware-Server, Virtuozzo",
      "schema.host.attr.notification" : "Benachrichtigungssystem eingeschaltet",
      "schema.service.desc.multiple_check_select_concurrency" : "Wähle einen Gleichzeitigkeitsfaktor",
      "text.report.availability.fatal" : "Fatale Fehler",
      "schema.service.text.multiple_force_next_check" : "Erzwinge einen Check aller Services so bald wie möglich",
      "schema.service.attr.mail_ok" : "Benachrichtigungen für OK Meldungen per E-Mail versenden",
      "text.sort_by_dots" : "Sortiere nach ...",
      "word.Services" : "Services",
      "site.wtrm.desc.userAgent" : "This is the User-Agent to send for all requests.",
      "nav.main.help" : "HELP",
      "schema.chart.attr.from_to" : "Von %s bis %s",
      "schema.plugin.attr.command" : "Kommando",
      "text.report.availability.LT300" : "Filterung von Ereignissen mit einer Statusdauer kleiner als 5 Stunden.",
      "err-415" : "Nicht authorisierter Zugriff!",
      "word.second" : "Sekunde",
      "schema.host.desc.os_product" : "z.B. RHEL5, Debian Lenny, Windows Server 2003",
      "err-427" : "Services, die von einem Host-Template vererbt wurden, können nicht gelöscht werden!",
      "action.yes_remove" : "<b>Ja, entfernen!</b>",
      "err-632" : "Der Parameter limit muss ein numerischer Wert sein, mindestens 0, maximal %s.",
      "site.wtrm.text.quick_check" : "Quick check!",
      "schema.hs_downtime.attr.description" : "Beschreibung",
      "schema.service.text.host_alive_check" : "Host-Alive-Check",
      "schema.timeperiod.text.create" : "Einen neuen Zeitplan erstellen",
      "text.filter_by_category_dots" : "Filter nach Kategorie ...",
      "schema.service.desc.multiple_check_type_title" : "Multiple Messpunkte",
      "site.wtrm.desc.parent" : "It's possible to set a parent ID. The ID, class or name is searched within the element of the parent ID.",
      "err-400" : "Der Login ist fehlgeschlagen. Bitte versuchen Sie es erneut!",
      "text.report.availability.h01" : "01:00 - 01:59",
      "nav.sub.timeperiods" : "Zeitplan",
      "nav.sub.groups" : "Gruppen",
      "site.wtrm.action.checkIfElementNotExists" : "Check if an <b>element does <i>NOT</i> exists</b>",
      "text.report.availability.AV-O" : "Der Zeitbereich in Prozent in dem der Service im Status OK war.",
      "action.safe" : "Speichern",
      "err-610" : "Bitte füllen Sie die rot markierten Felder korrekt aus!",
      "text.report.availability.h05" : "05:00 - 05:59",
      "text.dashboard.remove_dashlet" : "Das Dashlet entfernen",
      "schema.company.attr.title" : "Titel",
      "schema.service.desc.multiple_check_concurrency_title" : "Konkurrierende Checks",
      "text.report.title.number_of_events" : "Die totale Anzahl von Ereignissen",
      "action.generate" : "Generieren",
      "schema.contact.desc.mail_notification_level" : "Wähle die Status Level für die der Konakt eine Benachrichtigung per E-Mail erhalten soll.",
      "schema.service.text.rotate_location_check_button" : "Rotierende Checks",
      "schema.sms_send.text.search" : "Suche nach SMS",
      "schema.host.info.sysinfo" : "Externe Informationen sind verfügbar.",
      "site.wtrm.placeholder.parent" : "#parent-id (optional)",
      "schema.event.attr.attempts" : "Versuche",
      "action.resize" : "Größe ändern",
      "schema.service.attr.default_location" : "Standard Standort",
      "text.report.availability.LT60" : "Filterung von Ereignissen mit einer Statusdauer kleiner als 60 Minuten.",
      "text.report.availability.EV-C" : "Anzahl von Ereignissen mit Status CRITICAL. ",
      "schema.service.attr.mail_warnings" : "Benachrichtigungen für Warnmeldungen per E-Mail versenden",
      "schema.company.desc.active" : "Aktivierung oder Deaktivierung aller Objekte dieser Firma.",
      "word.seconds" : "Sekunden",
      "schema.host_template.test.host_members" : "Hosts in der Gruppe",
      "schema.company.attr.email" : "E-Mail",
      "site.wtrm.action.checkIfElementHasHTML" : "Check if an <b>element</b> contains <b>HTML</b>",
      "schema.service.desc.multiple_check_concurrency" : "Um eine Überladung des Service zu vermeiden, können\nSie die maximale Anzahl konkurrierenden Checks bestimmen.",
      "schema.company.text.settings" : "Einstellungen des Unternehmens",
      "info.update_failed" : "Das Update ist fehlgeschlagen!",
      "text.dashboard.service_chart" : "Service-Chart",
      "action.filter" : "Filtern",
      "site.wtrm.command.doCheck" : "Check the radio button or checkbox of element <b>%s</b> with value <b>%s</b>",
      "schema.host.text.view" : "Host %s",
      "schema.dependency.text.workflow_inherit" : "Vererbung aktivieren",
      "schema.service.desc.is_volatile" : "Mit dieser Option können Sie bestimmen, ob es sich bei diesem Service um einen flüchten Services handelt. Einige Services haben die Besonderheit, dass Sie nur für einen sehr kurzen Zeitraum kritisch sind. Dies können zum Beispiel Logdateien-Checks sein, in denen nach dem Vorhandensein bestimmter Strings gesucht wird, zum Beispiel Strings wie <i>possible break-in attempt</i>. Wenn beim nächsten Logdateien Check dieser String nicht mehr vorhanden ist, würde der Service wieder in den OK Status wechseln und man würde den Einbruch-Versuch nicht bemerken. Ein Service, der dagegen als ein flüchtiger Service konfiguriert ist, bleibt solange in einem nicht-OK Status, bis der Status aufgehoben wurde.",
      "schema.dependency.attr.timezone" : "Zeitzone",
      "err-630" : "Ungültige Parametereinstellungen gefunden!",
      "schema.contact.text.remove_timeperiod" : "Den Zeitplan vom Konakt entfernen",
      "text.report.availability.h00" : "00:00 - 00:59",
      "schema.host_template.text.selected_hosts" : "Selektierte Hosts",
      "action.clone" : "Klonen",
      "schema.user.desc.username" : "Angabe des Benutzernamens im Format <i>user@domain.test</i>.",
      "action.configure" : "Konfigurieren",
      "text.report.availability.EV-GE300" : "Anzahl von Ereignissen mit einer Statusdauer größer als 5 Stunden. ",
      "site.wtrm.command.checkIfElementIsSelected" : "Check if the value <b>%s</b> of the selectbox <b>%s</b> is selected",
      "schema.host.attr.virt_manufacturer" : "Virtualisierungshersteller",
      "schema.chart.text.back_to_selection" : "Zurück zur Chartauswahl",
      "schema.host.attr.variables" : "Host Variablen",
      "action.select" : "Auswählen",
      "schema.host.desc.hostname" : "Dies ist der vollständig qualifizierte Hostname.",
      "text.dashboard.create_dashboard" : "Ein leeres Dashboard erstellen",
      "schema.contactgroup.text.selected_services" : "Ausgewählte Services",
      "schema.company.attr.id" : "Firmen ID",
      "schema.service.text.host_template" : "Host template",
      "text.report.service_has_a_availabilty_of" : "Service %s hat eine Verfügbarkeit von",
      "schema.service.attr.acknowledged" : "Bestätigt",
      "nav.sub.charts" : "Charts",
      "schema.contact.text.timeperiod_type_send_to_all" : "E-Mails und SMS versenden",
      "word.hour" : "Stunde",
      "schema.service.text.no_command_options" : "Dieser Check hat keine Einstellungen.",
      "schema.host.attr.coordinates" : "Koordinaten",
      "schema.service.desc.comment" : "Dies ist ein beliebiges Kommentar zum Service.",
      "site.help.doc.user-charts" : "Benutzer Charts",
      "site.wtrm.placeholder.url" : "http://www.bloonix.de/",
      "text.second_failover_checkpoint" : "Zweiter Ausfallmesspunkt",
      "text.dashboard.services_availability" : "Verfügbarkeit aller Services",
      "schema.chart.text.multiselect" : "Chartauswahl für mehrere Hosts",
      "schema.host.desc.description" : "Das ist eine kurze Beschreibung zum Host.",
      "schema.contact.attr.escalation_level" : "Eskalationslevel",
      "schema.user.desc.role" : "Welche Rolle hat der Benutzer? Benutzer mit der Rolle <i>operator</i> sind Poweruser und können Benutzeraccounts und Gruppen verwalten. Benutzer mit der Gruppe <i>user</i> haben dazu keine Berechtigung.",
      "schema.host.text.multiple_selection_help" : "<h4>Diese Aktion erfordert, dass mindestens ein Host ausgewählt ist.</h4>\nUm einen einzelnen Host zu markieren, klicken Sie auf die entsprechende Zeile.\nWenn Sie mehrere Hosts markieren möchten, halten Sie einfach die Taste <i>STRG</i>\nauf Ihrer Tastatur gedrückt. Beim Drücken und Halten der <i>SHIFT</i>-Taste kann ein\ngrößerer Bereich von Hosts gewählt werden.",
      "site.wtrm.action.doCheck" : "Check a <b>radio button</b> or <b>checkbox</b>",
      "text.report.availability.h10" : "10:00 - 10:59",
      "action.action" : "Aktion",
      "schema.group.text.group_members" : "Mitglieder der Gruppe %s",
      "schema.service.text.multiple_activate" : "Mehrere Services aktivieren oder deaktivieren",
      "text.report.availability.Availability" : "Die totale Verfügbarkeit",
      "site.login.password" : "Passwort",
      "schema.host.desc.hw_product" : "z.B. Dell Power Edge 2950",
      "text.dashboard.really_delete_dashboard" : "Möchten Sie wirklich das Dashboard %s löschen?",
      "schema.timeperiod.attr.description" : "Beschreibung",
      "schema.contact.attr.sms_to" : "Mobilfunknummer",
      "schema.chart.attr.refresh" : "Aktualisierungsrate",
      "text.dashboard.list_top_hosts" : "Anzeigen der Top-Hosts",
      "schema.group.attr.description" : "Beschreibung",
      "err-410" : "Die angeforderte Seite wurde nicht gefunden!",
      "err-640" : "Keine Daten verfügbar!",
      "action.timeslices" : "Zeitpläne auflisten",
      "schema.service.text.notification_settings" : "Einstellungen zur Benachrichtigung",
      "err-631" : "Der Parameter offset muss ein numerischer Wert sein, mindestens 0.",
      "schema.host.text.add_host_to_host_template" : "Den Host Host-Templates zuordnen.",
      "schema.host_template.attr.id" : "Template ID",
      "site.wtrm.desc.password" : "This password for the auth basic authentification.",
      "schema.company.attr.sla" : "SLA",
      "schema.contact.text.timeperiod_type_send_only_sms" : "Nur SMS versenden",
      "err-426" : "Diese Aktion erfordert ein Session-Token!",
      "action.search" : "Suchen",
      "schema.group.text.update_user" : "Die Rechte ändern",
      "text.report.availability.h18" : "18:00 - 18:59",
      "site.wtrm.action.checkIfElementIsNotChecked" : "Check if a <b>radio button</b> or <b>checkbox is <i>NOT</i> checked</b>",
      "site.wtrm.text.check_it" : "Check it!",
      "action.reload" : "Reload",
      "schema.user.text.create" : "Einen neuen Benutzer erstellen",
      "text.report.availability.h06" : "06:00 - 06:59",
      "schema.user_chart.text.click_to_add_metric" : "Klicken, um die Metrik hinzuzufügen",
      "schema.timeperiod.desc.name" : "Dies ist der Name des Zeitplans.",
      "site.login.contact" : "Haben Sie Fragen?",
      "schema.service.attr.send_sms" : "Benachrichtigungen für SMS eingeschaltet",
      "nav.sub.dependencies" : "Abhängigkeiten",
      "site.wtrm.command.checkIfElementHasText" : "Check if the element <b>%s</b> contains <b>%s</b>",
      "text.report.availability.h04" : "04:00 - 04:59",
      "schema.chart.text.chart_id" : "Chart-ID: %s",
      "text.report.availability.h20" : "20:00 - 20:59",
      "schema.service.desc.attempt_warn2crit" : "Diese Option ist hilfreich, wenn Sie möchten, dass der Status von WARNING zu CRITICAL aufgewertet wird, nach dem der Services die maximale Anzahl von fehlgeschlagenen Versuchen erreicht hat.",
      "schema.dependency.text.service_to_host" : "Service zu Host",
      "schema.host.attr.last_check" : "Letzter Check",
      "word.Timezone" : "Zeitzone",
      "word.minute" : "Minute",
      "action.settings" : "Einstellungen",
      "site.wtrm.action.checkUrl" : "Check the <b>URL</b> in the address bar",
      "site.wtrm.command.doUncheck" : "Uncheck the radio button or checkbox <b>%s</b> with value <b>%s</b>",
      "text.from_now_to_2d" : "Von jetzt + 2 Tage",
      "schema.user_chart.attr.id" : "ID",
      "text.report.availability.EV-O" : "Anzahl von Ereignissen mit Status OK.",
      "info.move_with_mouse" : "Drücke und halte den linken Mausbutton während die Box runter oder hoch bewegt wird.",
      "schema.contact.attr.company_id" : "Firmen ID",
      "schema.group.text.add" : "Einen neuen Benutzer der Gruppe hinzufügen",
      "schema.dependency.text.host_to_host" : "Host zu Host",
      "schema.host_template.text.delete" : "Ein Template löschen",
      "schema.group.text.may_delete_services" : "Darf Services löschen",
      "schema.dependency.text.depends_on_host" : "hängt ab von Host",
      "schema.host.desc.virt_manufacturer" : "z.B. VMware, Parallels",
      "schema.contact.desc.escalation_level" : "Wähle ein Eskalationslevel für den Kontakt. Mit dem Eskalationslevel kann kontrolliert werden wann ein Kontakt eine Benachrichtigung erhält. Das Level <i>Permanent aktiv</i> bedeuted, dass der Konakt immer benachrichtigt wird. Das Level <i>aktiv nach 3 Benachrichtiungen</i> bedeuted, dass der Kontakt erst benachrichtigt wird, wenn für den Service bereits 3 Benachrichtigungen versendet wurden und noch immer in einem niht-OK Status ist.",
      "schema.company.attr.sms_enabled" : "SMS Benachrichtigungen eingeschaltet",
      "err-620" : "Das Objekt existiert bereits!",
      "schema.host.attr.max_sms" : "Maximale SMS pro Monat",
      "nav.sub.user_group_settings" : "Gruppeneinstellungen für Services",
      "schema.plugin.attr.id" : "Plugin-ID",
      "schema.user.attr.username" : "Benutzername",
      "schema.chart.attr.options" : "Chart Optionen",
      "schema.service.attr.check_by_location" : "Prüfung von verschiedenen Standorten",
      "schema.service.desc.fd_flap_count" : "Dies ist die maximale Anzahl von Statuswelchseln, die in einem bestimmten Zeitraum auftreten dürfen.",
      "nav.sub.users" : "Benutzer",
      "site.wtrm.command.doClick" : "Click on element <b>%s</b>",
      "text.report.title.status_duration_by_hour" : "Statusdauer nach Zeitbereich",
      "site.wtrm.placeholder.username" : "Username",
      "schema.service.desc.agent_tooltip" : "<h3>Installation des Bloonix-Agenten</h3>\n<p>\nDieser Check wird direkt auf dem Server ausgeführt und erfordert die Installation des Bloonix-Agenten\nsowie das Plugin auf dem Server.\n</p>",
      "text.report.availability.security" : "Sicherheitsproblem",
      "nav.sub.group_settings" : "Gruppeneinstellungen",
      "schema.event.attr.id" : "Event ID",
      "schema.host_template.text.view_services" : "View services",
      "site.login.forgot_password_info" : "Bitte beachten Sie, dass das Paswort nicht automatisch\nzu Ihrer registrierten E-Mail Adresse gesendet wird. Ein Administrator wird Ihre Anfrage\nprüfen und Sie so schnell wie möglich kontaktieren.",
      "schema.host.desc.allow_from" : "Es ist möglich eine Komma-separierte Liste von IP-Adressen anzugeben, von denen statistische Daten für den Host geliefert werden dürfen. Das Schlüsselwort <i>all</i> heißt von überall.",
      "schema.contactgroup.text.contact_members" : "Kontakte, die der Kontaktgruppe angehören",
      "schema.dependency.attr.inherit" : "Vererbung",
      "schema.contactgroup.text.group_members" : "Mitglieder der Kontaktgruppe",
      "schema.service.attr.description" : "Beschreibung",
      "site.wtrm.command.checkIfElementHasNotValue" : "Check if the input field or textarea with element <b>%s</b> does <i>NOT</i> contain <b>%s</b>",
      "text.report.availability.volatile" : "Flüchtig",
      "schema.service.attr.status_since" : "Status seit",
      "schema.user.text.repeat_password" : "Neues Passwort wiederholen",
      "bool.yesno.0" : "Nein",
      "schema.host.desc.sysgroup" : "Dies ist ein Feld das zur freien Verwendung steht.",
      "schema.host.text.settings" : "Einstellungen des Hosts",
      "schema.service.text.default_location_check_button" : "Standard Check",
      "schema.service.attr.volatile_retain" : "Vorhaltezeit des flüchtigen Status (volatile)",
      "schema.service.attr.plugin" : "Plugin",
      "schema.user.attr.id" : "Benutzer ID",
      "action.logout" : "Ausloggen",
      "schema.roster.attr.active" : "Aktiv",
      "schema.service.desc.failover_check_type" : "Bei Failover-Checks haben Sie die Möglichkeit,\neinen festen Messpunkt für die Serviceprüfungen auszuwählen. Zusätzlich können Sie zwei Messpunkte\nauswählen, von denen eine Prüfung vorgenommen wird, wenn die Prüfung vom festen Messpunkt\neinen Wert liefert, der nicht OK ist. Erst wenn das Resultat aller drei Messpunkte nicht OK ist,\nwird der Zähler für die maximalen Fehlversuche eines Service um eins erhöht.",
      "site.wtrm.action.doWaitForElement" : "Wait for element",
      "schema.service.action.clear_volatile_multiple" : "Den flüchtigen Status aufheben",
      "text.click_to_delete_seletion" : "Klicken um die Auswahl zu löschen",
      "schema.group.desc.company" : "Wähle ein Unternehmen zu der die Gruppe gehört",
      "err-702" : "Das Passwort ist zu lang (maximal 128 Zeichen)!",
      "schema.company.attr.state" : "Staat/Bundesland",
      "schema.chart.attr.datetime" : "Datum und Uhrzeit",
      "schema.chart.text.delete_view" : "Chartansicht löschen",
      "schema.dependency.text.active_time" : "Aktive Zeit",
      "schema.service.text.multiple_volatile" : "Den flüchtigen Status mehrerer Services aufheben",
      "action.generate_string" : "String generieren",
      "text.report.availability.EV-W" : "Anzahl von Ereignissen mit Status WARNING. ",
      "schema.service.attr.service_name" : "Servicename",
      "schema.service.text.attempt" : "Prüfungen",
      "schema.host.attr.id" : "Host ID",
      "site.wtrm.command.checkIfElementHasValue" : "Check if the input field or textarea with element <b>%s</b> contains <b>%s</b>",
      "schema.contact.text.list" : "Übersicht über alle Kontakte",
      "schema.service.attr.agent_id" : "Standort",
      "text.click_me" : "Klick mich",
      "schema.service.desc.default_check_type_title" : "Standard Messpunkt",
      "schema.user_chart.text.user_chart" : "User charts",
      "site.wtrm.command.checkUrlWithContentType" : "Check if the URL <b>%s</b> has content type %s",
      "schema.chart.attr.subtitle" : "Chart Untertitel",
      "text.report.availability.LT30" : "Filterung von Ereignissen mit einer Statusdauer kleiner als 30 Minuten.",
      "nav.sub.contactgroup_settings" : "Kontaktgruppen Einstellungen",
      "schema.dependency.text.workflow_from_host" : "Von Host",
      "schema.service.text.delete" : "Den Service löschen",
      "text.report.availability.h13" : "13:00 - 13:59",
      "word.Settings" : "Einstellungen",
      "schema.service.desc.rotate_check_type_title" : "Rotierende Messpunkte",
      "err-700" : "Bitte ändern Sie Ihr Passwort!",
      "schema.service.desc.service_name" : "Dies ist der Anzeigename des Service.",
      "text.dashboard.double_click_or_mouse_wheel_to_zoom" : "Doppelklick oder nutze das Mausrad um zu Zoomen",
      "site.help.doc.web-transactions" : "Web-Transactions",
      "err-634" : "Für den Paramter sort_by sind nur die Werte \"asc\" und \"desc\" erlaubt.",
      "text.dashboard.choose_content_box" : "Wähle ein Dashlet aus",
      "schema.service.info.notification" : "Benachrichtigungen sind ausgeschaltet.",
      "schema.service.desc.mail_soft_interval" : "Dies ist der Benachrichtigungsintervall für Services. Solange der Service nicht OK ist, erhalten Sie in diesem Intervall erneut Benachrichtigungen.",
      "word.no" : "nein",
      "site.help.doc.bloonix-webgui" : "Grundlegendes zur Bloonix-WebGUI",
      "action.genstr" : "Zeichenkette generieren",
      "schema.host.desc.password" : "Dieses Passwort wird für den Bloonix Agenten benötigt. Wenn der Agent Statistiken für einen Host zum Bloonix Server senden möchte dann ist dies nur möglich wenn der Agent die Host-ID und das Passwort kennt.",
      "schema.event.text.list" : "Ereignisse von Host %s",
      "info.create_success" : "Das Erstellen war erfolgreich!",
      "schema.host.text.delete" : "Den Host löschen",
      "schema.service.info.host_alive_check" : "Dies ist ein Host-Alive-Check.",
      "action.clear" : "Zurücksetzen",
      "schema.service.attr.last_mail" : "Letzte Benachrichtigung per E-Mail",
      "schema.dependency.text.host" : "Host",
      "action.operate_as" : "Operiere als",
      "schema.user.desc.password" : "Geben Sie das Passwort des Benutzers ein.",
      "schema.contactgroup.desc.description" : "Gebe eine kurze Beschreibung der Gruppe an.",
      "schema.contact.desc.sms_notification_level" : "Wähle die Status Level für die der Konakt eine Benachrichtigung per SMS erhalten soll.",
      "site.help.doc.add-new-service" : "Einen neuen Service anlegen",
      "schema.group.text.add_user" : "Den Benutzer der Gruppe hinzufügen",
      "schema.service.info.is_volatile" : "Der Service befindet sich in einem flüchtigen Status.",
      "schema.company.attr.phone" : "Telefon",
      "text.dashboard.replace_dashlet" : "Das Dashlet ersetzen",
      "schema.hs_downtime.attr.end_time" : "Endzeit",
      "schema.host.desc.ipaddr" : "Das ist die Haupt-IP-Adresse des Hosts.",
      "text.report.availability.flapping" : "Flapping",
      "text.inherited_from_host" : "Vererbt vom Host",
      "schema.service.attr.volatile_status" : "Der aktuelle flüchtige Status (volatile)",
      "schema.contactgroup.desc.name" : "Dies ist der Name der Kontaktgruppe. Der Name sollte einzigartig sein.",
      "schema.host.desc.add_host_to_host_template" : "Der Host erbt alle Services eines Host-Templates.",
      "schema.service.attr.fd_time_range" : "Zeitraum zur Erkennung von Statuswechsel",
      "schema.host.attr.virt_product" : "Virtualisierungsprodukt",
      "schema.host.text.remove_template_warning" : "Bitte beachte das alle Services des Templates von allen Hosts entfernt werden, die ihre Services aus diesem Tempalte vererbt bekommen haben!",
      "word.Timeslice" : "Zeitscheibe",
      "schema.host.text.multiple_edit_info" : "Leere Felder werden ignoriert!",
      "schema.user.text.current_password" : "Aktuelles Passwort",
      "schema.dependency.text.list" : "Abhängigkeiten für Host %s",
      "schema.company.attr.comment" : "Kommentar",
      "schema.service.attr.mail_soft_interval" : "Benachrichtigungsintervall für E-Mails (soft)",
      "nav.main.monitoring" : "MONITORING",
      "schema.user.text.view" : "Benutzer %s",
      "schema.host.action.enable_notifications_multiple" : "Benachrichtigungen einschalten für die selektierten Hosts",
      "text.fixed_checkpoint" : "Fixer Messpunkt",
      "schema.user.attr.name" : "Name",
      "schema.contact.desc.sms_to" : "Dies ist die Mobilfunknummer des Konakts. Benachrichtigung über Ereignisse werden an diese Rufnummer per SMS gesendet.",
      "schema.user_chart.attr.subtitle" : "Untertitel",
      "schema.dependency.text.host_to_service" : "Host zu Service",
      "schema.group.text.host_nonmembers" : "Nicht-Mitglieder der Gruppe",
      "text.report.availability.EV-LT60" : "Anzahl von Ereignissen mit einer Statusdauer kleiner als 60 Minuten. ",
      "schema.host.attr.description" : "Beschreibung",
      "schema.service.text.services" : "Services",
      "site.wtrm.command.doSubmit" : "Submit form <b>%s</b>",
      "text.report.availability.LT180" : "Filterung von Ereignissen mit einer Statusdauer kleiner als 3 Stunden.",
      "text.report.title.number_of_events_by_tags" : "Anzahl der Ereignisse nach Tags",
      "word.minutes" : "Minuten",
      "schema.hs_downtime.text.preset" : "Voreinstellung",
      "text.report.availability.EV-LT300" : "Anzahl von Ereignissen mit einer Statusdauer kleiner als 5 Stunden.",
      "site.wtrm.command.checkIfElementHasNotHTML" : "Check if the element <b>%s</b> does <i>NOT</i> contain <b>%s</b>",
      "schema.service.attr.fd_flap_count" : "Maximale Anzahl von Statuswechsel",
      "site.wtrm.command.checkIfElementNotExists" : "Check if the element <b>%s</b> does <i>NOT</i> exists",
      "text.dashboard.delete_dashboard" : "Das Dashboard löschen",
      "schema.service.text.failover_location_check_button" : "Ausfall Checks",
      "text.change_your_password" : "Ändere dein Passwort",
      "schema.host.desc.location" : "z.B. Hamburg, Rechenzentrum 3, Raum 6, Schrank A29",
      "schema.user_chart.desc.title" : "Der Titel des Chart.",
      "text.plugin_info" : "Plugin Informationen",
      "schema.service.attr.sms_ok" : "Benachrichtigungen für OK Meldungen per SMS versenden",
      "schema.host_template.text.view" : "Template %s",
      "nav.main.administration" : "ADMINISTRATION",
      "schema.host_template.test.host_nonmembers" : "Hosts nicht in der Gruppe",
      "schema.host.attr.active" : "Aktiv",
      "site.help.doc.bloonix-agent-installation" : "Den Bloonix-Agenten installieren",
      "site.wtrm.text.service_report" : "Web-Transaktions-Report für Service %s",
      "action.list" : "Auflisten",
      "schema.roster.attr.description" : "Beschreibung",
      "schema.group.text.selected_hosts" : "Ausgewählte Hosts",
      "schema.dependency.text.depends_on_service" : "hängt ab von Service",
      "schema.group.text.host_members" : "Mitglieder der Gruppe",
      "nav.sub.host_group_settings" : "Gruppeneinstellungen für Hosts",
      "schema.host.desc.device_class" : "z.B.<br/>/Server/Linux/Debian<br/>/Server/Windows/Windows 2008<br/>/Network/Router<br/>/Network/Switch<br/>/Printer",
      "text.report.title.total_availability" : "Die totale Service-Verfügbarkeit",
      "action.extsearch" : "Erweiterte Suche",
      "schema.user_chart.desc.description" : "Beschreibung zum Chart.",
      "word.To" : "Bis",
      "schema.service.info.acknowledged" : "Der Status des Service wurde bestätigt.",
      "nav.sub.contactgroup_members" : "Kontakte in der Kontaktgruppe",
      "schema.service.text.choose_plugin" : "Wähle ein Plugin",
      "site.wtrm.action.checkIfElementExists" : "Check if an <b>element exists</b>",
      "schema.user.desc.select_language" : "Bitte beachten Sie das die WebGUI nach der Auswahl neu geladen wird und Sie zum Dashboard umgeleitet werden!",
      "site.login.username" : "E-Mail Adresse",
      "schema.contact.attr.sms_notification_level" : "Benachrichtigungslevel für SMS",
      "schema.chart.attr.chart_size" : "Größe",
      "schema.user.desc.authentication_key" : "Mit diesem Schlüssel ist es möglich den Nachrichtenbildschirm ohne Passwortauthentifizierung aufzurufen. Ein Aufruf des Nachrichtenbildschirm erfolgt über den Query-String<br/><br/><b>/screen/?username=XXX;authkey=XXX</b>",
      "schema.host.desc.notification" : "Aktiere oder deaktiviere die Benachrichtigungen aller Services.",
      "text.dashboard.add_new_dashlet" : "Ein neues Dashlet hinzufügen",
      "word.Filter" : "Suchfilter",
      "site.help.doc.the-agent-id" : "Standort-Checks im Detail",
      "schema.service.attr.attempt_warn2crit" : "Wechsel von WARNING zu CRITICAL",
      "schema.hs_downtime.attr.begin_time" : "Anfangszeit",
      "site.wtrm.action.doUrl" : "Go to <b>URL</b>",
      "text.report.availability.h16" : "16:00 - 16:59",
      "schema.dependency.text.workflow_from_service" : "und von Service",
      "schema.chart.text.safe_view" : "Ansicht speichern",
      "schema.chart.text.user_charts" : "User charts",
      "schema.service.text.create" : "Einen neuen Service erstellen",
      "site.wtrm.attr.password" : "Password",
      "site.wtrm.attr.text" : "Inner text",
      "schema.company.attr.zipcode" : "Postleitzahl",
      "site.login.login" : "Bitte loggen Sie sich mit Ihrem Benutzernamen und Passwort ein:",
      "schema.service.action.acknowledge_multiple" : "Den Status der selektierten Services bestätigen",
      "schema.service.attr.status" : "Status",
      "schema.company.text.delete" : "Unternehmen löschen",
      "schema.user.desc.manage_templates" : "Darf der Benutzer Host-Templates verwalten?",
      "site.login.request_failed" : "Ihre Anfrage konnte nicht gesendet werden. Bitte versuchen Sie es erneut.",
      "action.edit" : "Editieren",
      "schema.user.attr.allow_from" : "Erlaubter IP-Zugriff",
      "schema.host.desc.timeout" : "Das ist der Timeout aller Services des Hosts. Wenn in dieser Zeit der Status eines Service nicht aktualisiert wurde, dann wird ein kritischer Status gesetzt mit der Information, dass der Bloonix-Agent wohlmöglich ausgefallen ist.",
      "site.login.title" : "Login zum Monitoring-System",
      "site.wtrm.attr.element" : "Element",
      "schema.service.attr.next_check" : "Nächste Prüfung",
      "site.wtrm.action.checkIfElementHasNotText" : "Check if an <b>element does <i>NOT</i></b> contain <b>text</b>",
      "schema.host.text.add_host_to_contactgroup" : "Den Host einer Kontaktgruppe hinzufügen",
      "site.help.doc.contacts-and-notifications" : "Kontakte und Benachrichtigungen",
      "schema.service.desc.mail_hard_interval" : "Mit dieser Option können Sie einen harten Benachrichtigungsintervall setzen. Auch wenn der Service zu OK und dann wieder zu CRITICAL wechselt, so erhalten Sie erst nach Ablauf dieses Intervalls erneut eine Benachrichtigung.",
      "schema.group.text.remove_user" : "Den Benutzer aus der Gruppe entfernen",
      "site.wtrm.desc.ms" : "This is the time in milliseconds to sleep between actions.",
      "schema.plugin_stats.text.list" : "Metriken von Plugin %s",
      "schema.service.info.active" : "Der Service ist deaktiviert.",
      "schema.group.desc.groupname" : "Das ist der Name der Gruppe. Der Name sollte einzigartig sein.",
      "text.dashboard.services_flapping" : "Flapping",
      "schema.service.attr.attempt_counter" : "Prüfzähler",
      "schema.dependency.text.create" : "Eine neue Abhängigkeit für Host %s erstellen",
      "site.login.want_to_login" : "Möchten Sie sich einloggen?",
      "text.dashboard.open_dashboard" : "Ein Dashboard öffnen",
      "schema.service.desc.passive_check" : "Ein passiver Check ist ein Check, der nicht von Bloonix selbst geprüft wird, sondern von einem externen Service oder Skriptund haben keinen Timeout. Passive Checks eignen sich zum Beispiel für SNMP Traps. Dabei meldet ein externer Service einen kritischen Status an den Bloonix-Agenten, dieser wiederrum meldet den Status an den Bloonix-Server.",
      "action.cancel" : "Abbrechen",
      "schema.contactgroup.text.create" : "Eine neue Kontaktgruppe erstellen",
      "schema.dependency.text.workflow_to_host" : "zu Host",
      "err-605" : "Bitte wählen Sie mindestens ein Objekt aus!",
      "schema.company.attr.alt_company_id" : "Reale Firmen ID",
      "text.report.title.no_data" : "Für die folgenden Services stehen keine Daten in diesem Zeitbereich zur Verfügung",
      "schema.timeperiod.text.delete" : "Den Zeitplan löschen",
      "text.from_now_to_1h" : "Von jetzt + 1 Stunde",
      "schema.host_template.desc.description" : "Gebe eine kurze Beschreibung zum Template an.",
      "schema.contact.desc.mail_to" : "Dies ist die E-Mail Adresse des Konakts. Benachrichtigung über Ereignisse werden an diese Adresse gesendet.",
      "schema.service.desc.multiple_check_type" : "Mit den Multiplen-Checks haben Sie die Möglichkeit, verschiedene Messpunkte auszuwählen, von denen eine Service-Prüfung gleichzeitig ausgeführt\nwird. Erst wenn von drei Messpunkten ein kritisches Resultat geliefert wird, wird der Zähler\nvon für die maximalen Fehlversuche eines Service um eins erhöht.<br/><br/>\nUm Ihren Service nicht zu überlasten, werden maximal\n3 Messpunktprüfungen gleichzeitig ausgeführt, es findet jedoch immer eine Prüfung\nvon allen Messpunkten aus statt, auch wenn mehr als 3 Prüfungen kritisch sind.",
      "site.wtrm.placeholder.value" : "value",
      "schema.host.attr.device_class" : "Bauklasse",
      "site.help.doc.notification-screen" : "Notification Screen",
      "schema.chart.text.service_charts" : "Service charts",
      "action.update" : "Aktualisieren",
      "schema.company.attr.max_services" : "Maximale Services",
      "schema.group.attr.company_id" : "Firmen ID",
      "site.wtrm.action.checkIfElementHasNotHTML" : "Check if an <b>element does <i>NOT</i></b> contain <b>HTML</b>",
      "schema.host.attr.timeout" : "Timeout",
      "schema.timeperiod.examples" : "<p><b>Syntax: TAG-BEREICH ZEIT-BEREICH</b></p></br>\n<pre>\nTAG BEREICH                     BEISPIELE\n------------------------------------------------------------\nWeekday                         Monday\nWeekday - Weekday               Monday - Friday\nMonth                           Januar\nMonth - Month                   Januar - July\nMonth Day                       Januar 1\nMonth Day - Month Day           Januar 1 - July 15\nYear                            2010\nYear - Year                     2010 - 2012\nYYYY-MM-DD                      2010-01-01\nYYYY-MM-DD - YYYY-MM-DD         2010-01-01 - 2012-06-15\n</pre></br>\n<pre>\nZEIT BEREICH                    BEISPIELE\n------------------------------------------------------------\nHH:MM - HH:MM                   09:00 - 17:00\nHH:MM - HH:MM, HH:MM - HH:MM    00:00 - 08:59, 17:01 - 23:59\n</pre></br>\n<p><b>Bespiele:</b></p></br>\n<pre>\nMonday - Friday     09:00 - 17:00\nMonday - Friday     00:00 - 08:59, 17:01 - 23:59\nSaturday - Sunday   00:00 - 23:59\n</pre></br>",
      "schema.service_downtime.text.title" : "Geplante Service-Wartungsarbeiten für Host %s",
      "nav.sub.rosters" : "Bereitschaftsplan",
      "schema.dependency.text.no_dependencies" : "Es sind keine Abhängigkeiten konfiguriert!",
      "schema.event.attr.duration" : "Dauer",
      "schema.contact.text.settings" : "Einstellungen des Kontakts",
      "text.report.availability.h11" : "11:00 - 11:59",
      "text.report.availability.lt300" : "Zwischen 3 und 5 Stunden",
      "schema.service.text.view_location_report" : "Standortreport einsehen",
      "site.wtrm.attr.parent" : "Parent ID",
      "schema.chart.attr.to" : "Bis",
      "schema.group.text.list" : "Übersicht über alle Gruppen",
      "site.login.forgot_password" : "Haben Sie Ihr Passwort vergessen?",
      "schema.service.text.command_options" : "Check Einstellungen",
      "schema.host.text.list" : "Übersicht über alle Hosts",
      "schema.user.desc.company" : "Wähle ein Unternehmen zu dem der Benutzer gehört.",
      "site.login.sign_up" : "Registrieren Sie sich für einen Bloonix Account",
      "err-425" : "Ihr Session-Token ist abgelaufen!",
      "schema.timeslice.attr.id" : "ID",
      "text.report.availability.h21" : "21:00 - 21:59",
      "schema.dependency.text.workflow_from_host_status" : "Wähle den Status des Hosts, welcher den Abhängigkeitsfluss aktiviert",
      "schema.sms_send.text.list" : "Gesendete SMS für Host %s",
      "schema.service.desc.sms_hard_interval" : "Mit dieser Option können Sie einen harten Benachrichtigungsintervall setzen. Auch wenn der Service zu OK und dann wieder zu CRITICAL wechselt, so erhalten Sie erst nach Ablauf dieses Intervalls erneut eine Benachrichtigung.",
      "schema.service.text.multiple_location_check_button" : "Mehrfache Checks",
      "site.wtrm.action.doAuth" : "Set auth basic <b>username</b> and <b>password</b>",
      "err-600" : "Das angeforderte Objekt existiert nicht!",
      "site.wtrm.action.doSleep" : "<b>Sleep</b> a while",
      "schema.chart.text.selected" : "selektiert",
      "schema.user_chart.text.delete" : "Chart löschen",
      "schema.plugin.attr.plugin" : "Plugin",
      "site.login.follow" : "Folgen Sie Bloonix",
      "site.wtrm.attr.username" : "Username",
      "text.report.availability.h19" : "19:00 - 19:59",
      "schema.service.attr.sms_hard_interval" : "Benachrichtigungsintervall für SMS (hart)",
      "schema.company.attr.address2" : "Adresse 2",
      "text.dashboard.map_title" : "Globale Host Status Karte",
      "text.report.availability.EV-I" : "Anzahl von Ereignissen mit Status INFO. ",
      "action.replace" : "Ersetzen",
      "schema.contactgroup.text.list" : "Übersicht über alle Kontaktgruppen",
      "schema.chart.text.chart_information" : "Chart Informationen",
      "schema.event.attr.status" : "Status",
      "schema.service.desc.notification" : "Diese Option aktiviert oder deaktiviert Benachrichtigungen für den Service.",
      "site.help.doc.host-templates" : "Host Templates einrichten und verwalten",
      "schema.timeperiod.attr.name" : "Zeitplan",
      "schema.company.attr.name" : "Name",
      "schema.dependency.attr.on_host_id" : "Depends on host ID",
      "schema.service.text.title" : "Services",
      "schema.contactgroup.text.host_members" : "Hosts, die der Kontaktgruppe angehören",
      "schema.service.desc.rotate_check_type" : "Die Rotate-Checks haben keinen festen Messpunkt.\nStattdessen rotieren die Services-Prüfungen über die ausgewählten Messpunkte.\nSollte die Prüfung von einem Messpunkt nicht OK sein, wird sofort zum nächsten Messpunkt\ngesprungen. Sollte auch der dritte Messpunkt ein Resultat liefern, welcher nicht OK ist, so wird\nder Zähler für die maximalen Fehlversuche eines Service um eins erhöht.",
      "word.day" : "Tage",
      "schema.user.desc.name" : "Das ist der Name des Benutzers.",
      "action.delete" : "Löschen",
      "action.create" : "Erstellen",
      "schema.host_template.desc.name" : "Dies ist der Name des Templates.",
      "site.wtrm.placeholder.element" : "#element-id OR .class-name OR name",
      "schema.chart.text.view" : "Charts für Host %s",
      "schema.service.text.list" : "Übersicht über alle Services",
      "schema.host.text.multiple_edit" : "Die Konfiguration mehrerer Hosts editieren",
      "text.report.title.total_status_duration" : "Die Dauer der Ereignisse nach Status",
      "schema.contact.desc.sms_notifications_enabled" : "Mit dieser Option ist es möglich die Benachrichtigung per SMS ein- oder auszuschalten.",
      "schema.service.action.activate_multiple" : "Selektierte Services aktivieren",
      "schema.chart.text.charts" : "Charts",
      "site.wtrm.command.checkIfElementIsNotChecked" : "Check if the radio button or checkbox <b>%s</b> is <i>NOT</i> checked",
      "text.please_select_objects" : "Bitte selektieren Sie mindestens ein Objekt!",
      "schema.chart.text.multiview" : "Anzeige mehrerer Charts",
      "text.dashboard.list_top_services" : "Anzeige der Top-Services",
      "text.min_length" : "Mindestlänge %s",
      "schema.host.text.report_title" : "Bericht für Host %s",
      "schema.group.text.settings" : "Einstellungen der Gruppe",
      "schema.service.info.inherits_from_host_template" : "Dieser Service wird von einem Host Template vererbt.",
      "schema.host.attr.hostname" : "Hostname",
      "schema.group.text.may_create_services" : "Darf Services erstellen",
      "schema.host.attr.sysgroup" : "Systemgruppe",
      "schema.dependency.text.workflow_from_service_status" : "Wähle den Status des Services, welcher den Abhängigkeitsfluss aktiviert",
      "schema.company.text.create" : "Erstelle ein Unternehmen",
      "schema.chart.attr.title" : "Chart Titel",
      "schema.hs_downtime.attr.id" : "ID",
      "err-417" : "Sie haben nicht genügend Rechte um ein Objekt zu erstellen!",
      "action.schedule" : "Planen",
      "text.report.availability.h09" : "09:00 - 09:59",
      "schema.user.attr.locked" : "Gesperrt",
      "schema.contactgroup.text.delete" : "Die Kontaktgruppe löschen",
      "text.dashboard.default_dashboard_cannot_deleted" : "Das Standard-Dashboard kann nicht gelöscht werden!",
      "text.last_30d" : "Die letzten 30 Tage",
      "word.No" : "Nein",
      "schema.hs_downtime.text.create" : "Erstelle eine geplante Wartungsarbeit",
      "site.wtrm.command.checkIfElementHasHTML" : "Check if the element <b>%s</b> contains <b>%s</b>",
      "text.dashboard.safe_dashboard" : "Dashboard speichern",
      "schema.service.attr.result" : "Erweiterte Status Information",
      "schema.host.desc.hw_manufacturer" : "z.B. IBM, HP, Dell, Fujitsu Siemens",
      "schema.company.attr.surname" : "Vorname",
      "schema.user.desc.locked" : "Darf sich der Benutzer einloggen?",
      "schema.contactgroup.attr.name" : "Name",
      "word.Relative" : "Relativ",
      "schema.chart.text.load_view" : "Ansicht laden",
      "err-703" : "Das Passwort ist zu kurz (minimum 8 Zeichen)!",
      "site.wtrm.action.doFill" : "Fill data into a <b>input</b> field or <b>textarea</b>",
      "schema.host.desc.max_sms" : "In diesem Feld kann die maximale Anzahl von SMS pro Monat für diesen Host gesetzt werden.",
      "text.dashboard.services_acknowledged" : "Bestätigt",
      "schema.service.desc.mail_warnings" : "Diese Option aktiviert oder deaktiviert das Versenden von Nachrichten per E-Mail für Services im Status WARNING.",
      "site.wtrm.placeholder.html" : "<span>Loren ipsum...</span>",
      "schema.service.text.multiple_acknowledge" : "Den Status mehrerer Services bestätigen",
      "schema.service.desc.sms_soft_interval" : "Dies ist der Benachrichtigungsintervall für Services. Solange der Service nicht OK ist, erhalten Sie in diesem Intervall erneut Benachrichtigungen.",
      "site.wtrm.placeholder.password" : "Secret",
      "schema.host.attr.hw_manufacturer" : "HW Hersteller",
      "schema.contact.text.escalation_level_event.x" : "aktiv nach %s Benachrichtiungen",
      "schema.service.desc.description" : "Dies ist eine kurze Beschreibung zum Service.",
      "schema.user_chart.attr.title" : "Titel",
      "schema.user.desc.phone" : "Die Rufnummer kann sehr hilfreich für Kollegen oder dem Bloonix-Support in dringenden Notfällen sein.",
      "site.help.doc.bloonix-agent-configuration" : "Den Bloonix-Agenten konfigurieren",
      "schema.dependency.attr.on_status" : "Übergeordneter Status",
      "nav.sub.templates" : "Templates",
      "text.report.availability.lt30" : "Zwischen 15 und 30 Minuten",
      "schema.contactgroup.text.settings" : "Einstellungen der Kontaktgruppe",
      "site.help.doc.add-new-host" : "Einen neuen Host anlegen",
      "schema.host.action.add_template" : "Template hinzufügen",
      "schema.hs_downtime.text.delete" : "Lösche eine geplante Wartungsarbeit",
      "err-419" : "Sie haben nicht genügend Rechte um das Objekt zu löschen!",
      "text.max_length" : "Maximallänge %s",
      "nav.main.report" : "REPORT",
      "text.report.availability.h23" : "23:00 - 23:59",
      "schema.service.attr.timeout" : "Timeout",
      "site.help.title" : "Die Bloonix Hilfe",
      "schema.service.attr.flapping" : "Flapping",
      "text.dashboard.dashlet_select_chart_title" : "Wähle einen Chart für das Dashlet",
      "text.dashboard.dashlet_select_chart" : "Wähle einen Chart",
      "text.first_failover_checkpoint" : "Erster Ausfallmesspunkt",
      "schema.chart.text.really_delete_view" : "Möchten Sie wirklich die Chart Ansicht <b>%s</b> löschen?",
      "schema.service.desc.agent_id" : "Standort der Prüfung",
      "schema.service.desc.rotate_check_type_locations" : "Ihr Service wird von folgenden Messpunkten überprüft:",
      "text.dashboard.services_notification" : "Benachrichtigungsstatus aller Services",
      "schema.contact.text.timeperiods" : "Zeitpläne des Kontakts",
      "schema.dependency.attr.id" : "Dependency ID",
      "text.dashboard.title" : "Dashboard",
      "schema.user.attr.manage_contacts" : "Verwaltung von Kontakten?",
      "schema.user.text.list" : "Übersicht über alle Benutzer",
      "schema.service.desc.mail_ok" : "Diese Option aktiviert oder deaktiviert das Versenden von Nachrichten per E-Mail für Services die in den Status OK zurückwechseln.",
      "info.extended_search_syntax_for_hosts" : "<p>Es ist möglich die Hostliste durch eine Suchabfrage zu filtern. Die Syntax ist sehr einfach und sieht wie folgt aus::</p>\n<pre>Schlüssel:Wert</pre>\n<p>Der Schlüssel ist das Tabellenfeld, in dem nach dem Wert gesucht werden solll.</p>\n<p>Suchbeispiele:</p>\n<p>- Suche nach Hosts mit Status CRITICAL oder UNKNOWN</p>\n<pre>status:CRITICAL OR status:UNKNOWN</pre>\n<p>- Suche nach Hosts im Datacenter 12 mit Status CRITICAL</p>\n<pre>location:\"Datacenter 12\" AND status:CRITICAL</pre>\n<p>Die folgenden Schlüssel sind für die spezifische Suche verfügbar:</p>",
      "site.wtrm.desc.text" : "The inner text of an element you wish to check.",
      "word.Yes" : "Ja",
      "word.Preset" : "Voreinstellung",
      "schema.host.text.mtr_output" : "MTR Ergebis von Host %s",
      "action.quicksearch" : "Schnellsuche",
      "schema.dependency.attr.status" : "Status",
      "schema.service.attr.ref_id" : "ID",
      "schema.group.attr.id" : "Gruppen ID",
      "schema.chart.attr.id" : "Chart ID",
      "site.wtrm.text.wtrm_workflow" : "Web Transaction Workflow",
      "schema.host.desc.comment" : "Dieses Feld kann für Kommentare verwendet werden.",
      "text.report.availability.agent_dead" : "Agent tot",
      "site.wtrm.desc.url" : "This is the full URL to request. As example: http://www.bloonix.de/",
      "schema.dependency.text.workflow_to_service" : "und zu Service",
      "schema.host.text.add_host_to_group" : "Den Host einer Gruppe hinzufügen",
      "schema.host.desc.active" : "Aktiviere oder deaktiviere den Host und alle Services.",
      "schema.service.attr.volatile_since" : "Seit wann ist der Status flüchtig (volatile)",
      "schema.user_chart.text.create" : "Einen Chart erstellen",
      "schema.host.text.device_class_help_link" : "Lesen Sie wie dieses Feature funktioniert",
      "schema.user.text.session_expires" : "Session läuft ab",
      "err-801" : "Sorry, aber Sie dürfen nicht mehr als %s Services einrichten!",
      "text.dashboard.top_hosts_events" : "Anzeige der Top-Events aller Hosts",
      "text.report.availability.h22" : "22:00 - 22:59",
      "nav.sub.reports" : "Berichte",
      "schema.chart.text.alignment" : "Chartausrichtung",
      "word.Absolute" : "Absolut",
      "err-704" : "Die Passwörter stimmen nicht überein!",
      "schema.plugin.attr.categories" : "Kategorien",
      "schema.service.desc.agent_id_tooltip" : "<h4>Von welchem Standort aus soll der Check ausgeführt werden?</h4>\n<p>\nEs gibt die Optionen <i>localhost</i>, <i>intranet</i> und <i>remote</i>.\n</p>\n<h3>localhost</h3>\n<p>\nMit der Option <i>localhost</i> wird der Check lokal auf Ihrem Server ausgeführt.\nHierzu ist es notwendig, dass der Bloonxi-Agent auf Ihrem Server installiert ist.\nDiese Option ist besonders sinnvoll, wenn Sie die Systemvitals, wie zum Beispiel die\nCPU, den Hauptspeicher oder auch die Festplatten überwachen möchten.\n</p>\n<h3>intranet</h3>\n<p>\nMit der Option <i>intranet</i> ist ihr lokales Netzwerk gemeint. Hierfür ist es notwendig,\ndass Sie den Bloonix-Agenten in Ihrem lokalen Netzwerk auf einem zentralen Server installieren.\nVon diesem Server aus werden die Checks ausgeführt. Diese Option ist sinnvoll, wenn Ihre Server\nServices bereitstellen, welche nicht über eine Internetanbindung erreichbar sind, aber dennoch\nvon einem anderen Server aus überprüft werden sollen. Das können zum Beispiel Router, Switches\netc. sein.\n</p>\n<h3>remote</h3>\n<p>\nMit der Option <i>remote</i> wird der Check von einem externen Bloonix-Server ausgeführt. Dies ist besonders für\nServices sinnvoll, die Dienste für Andere bereitstellen. Zum Beispiel können Sie über einen externen Check die\nFunktionalität Ihres Webservers bzw. Ihrer Webseiten überprüfen.\n</p>",
      "site.login.choose_your_language" : "Wählen Sie Ihre Sprache",
      "schema.service.desc.sms_warnings" : "Diese Option aktiviert oder deaktiviert das Versenden von Nachrichten per SMS für Services im Status WARNING.",
      "text.from_now_to_7d" : "Von jetzt + 7 Tage",
      "schema.host_template.text.delete_service_warning" : "Bitte beachte dass dieser Service von allen Hosts gelöscht wird, die diesen Service über das Template vererbt bekommen!",
      "schema.chart.text.selected_max_reached" : "(max) selektiert",
      "schema.service.text.settings" : "Einstellung des Service %s",
      "site.wtrm.action.checkIfElementIsChecked" : "Check if a <b>radio button</b> or <b>checkbox</b> is <b>checked</b>",
      "site.wtrm.action.checkIfElementHasValue" : "Check the <b>value</b> of an <b>input</b> field or <b>textarea</b>",
      "schema.plugin.attr.description" : "Beschreibung",
      "schema.user_chart.text.title" : "Benutzer Charts",
      "nav.sub.services" : "Services",
      "schema.sms_send.attr.time" : "Zeitstempel",
      "schema.dependency.text.dependencies" : "Abhängigkeiten",
      "schema.service.desc.failover_check_type_locations" : "Bitte wählen Sie einen festen und zwei Failover Messpunkte aus",
      "site.wtrm.desc.contentType" : "Enter content type that is expeced for the URL.",
      "action.no_abort" : "<b>Nein, abbrechen!</b>",
      "text.from_now_to_4h" : "Von jetzt + 4 Stunden",
      "schema.service.attr.scheduled" : "Hat eine Downtime",
      "schema.host.text.multiple_activate" : "Mehrere Hosts aktivieren oder deaktivieren",
      "schema.group.attr.groupname" : "Gruppenname",
      "action.members" : "Mitglieder auflisten",
      "schema.host.attr.company_id" : "Firmen ID",
      "word.active" : "aktiv",
      "schema.host.attr.comment" : "Kommentar",
      "schema.service.desc.timeout" : "Das ist der Timeout des Service. Wenn in dieser Zeit der Status des Service nicht aktualisiert wurde, dann wird ein kritischer Status gesetzt mit der Information, dass der Bloonix-Agent wohlmöglich ausgefallen ist. Wenn kein Wert gesetzt ist, dann wird der Timeout des Hosts vererbt.",
      "schema.user.attr.comment" : "Kommentar",
      "err-633" : "Der Parameter sort_by muss mit einem Zeichen von a-z beginnen und nur Zeichen von a-z, 0-9 und ein Unterstrich sind erlaubt. Die maximale Länge beträgt 63 Zeichen.",
      "schema.contactgroup.text.selected_hosts" : "Ausgewählte Hosts",
      "schema.user.desc.allow_from" : "Es ist möglich eine Komma-separierte Liste von IP-Adressen anzugeben, von denen sich der Benutzer einloggen darf. Das Schlüsselwort <i>all</i> heißt von überall.",
      "schema.contact.desc.mail_notifications_enabled" : "Mit dieser Option ist es möglich die Benachrichtigung per E-Mail ein- oder auszuschalten.",
      "schema.company.desc.max_services" : "Die maximale Anzahl an Services die überwacht werden dürfen. Setze 0 (null) wenn es kein Limit gibt.",
      "schema.user.attr.role" : "Rolle",
      "site.wtrm.command.doWaitForElement" : "Wait for element <b>%s</b>",
      "text.locations_selected_costs" : "Sie haben %s Messpunkte ausgewählt. Bitte beachten Sie, dass jeder Kontrollpunkt extra berechnet wird.",
      "site.login.documentation" : "Die Bloonix Dokumentation",
      "text.report.availability.h02" : "02:00 - 02:59",
      "schema.chart.text.select" : "Chartauswähl für Host %s",
      "site.wtrm.attr.html" : "Inner HTML",
      "schema.host.text.list_device_classes" : "Device Klassen",
      "schema.host_template.text.delete_service" : "Einen Service aus dem Template löschen",
      "schema.service.desc.volatile_retain" : "Mit dieser Option kann konfiguriert werden, ob der flüchtige Status eines Services nach einer bestimmten Zeit automatisch aufgehoben wird.",
      "schema.service.attr.last_sms_time" : "Letzte Benachrichtigung per SMSRNUNGEN per E-Mail versenden",
      "word.hours" : "Stunden",
      "schema.host.desc.add_host_to_contactgroup" : "Füge den Host einer Kontaktgruppe hinzu",
      "schema.timeperiod.text.examples" : "Beispiel für Zeitpläne",
      "schema.dependency.attr.timeslice" : "Zeitabschnitt",
      "schema.host_template.text.list" : "Übersicht über alle Host-Templates",
      "word.days" : "Tage",
      "schema.service.attr.is_volatile" : "Ist der Service flüchtig (volatile)",
      "info.go-back" : "Zurück",
      "err-405" : "Ihre Session ist abgelaufen!",
      "word.debug" : "Debug",
      "schema.service.attr.last_event" : "Letzes Ereignis",
      "schema.hs_downtime.text.select_services" : "Services<br/><small>Bitte wählen Sie keine Services aus, wenn<br/>Sie eine Downtime für den gesamten Host<br/>einrichten möchten.</small>",
      "err-418" : "Sie haben nicht genügend Rechte um das Objekt zu modifizieren!",
      "text.report.availability.LT15" : "Filterung von Ereignissen mit einer Statusdauer kleiner als 15 Minuten.",
      "schema.service.desc.acknowledged" : "Diese Option ist hilfreich wenn ein Service nicht OK ist und Sie das Benachrichtiungen temporär ausschalten möchten. Die Benachrichtigungen werden automatisch wieder eingeschaltet, wenn der Service in den Status OK gewechselt ist.",
      "site.wtrm.desc.username" : "This username for the auth basic authentification.",
      "nav.sub.mtr" : "MTR",
      "text.report.availability.h14" : "14:00 - 14:59",
      "site.wtrm.desc.value" : "The value of the element you wish to fill or check.",
      "schema.contact.attr.mail_notification_level" : "Benachrichtigungslevel für E-Mails",
      "text.report.availability.ge300" : "Länger als 3 Stunden",
      "nav.sub.screen" : "Bildschirm",
      "schema.service.text.multiple_notification" : "Die Benachrichtigungen für mehrere Services ein- oder ausschalten",
      "site.help.doc.host-and-service-dependencies" : "Abhängigkeiten zwischen Hosts und Services",
      "action.view_selected_objects" : "Ausgewählte Objekte einsehen",
      "site.wtrm.command.doSelect" : "Select the value <b>%s</b> from the selectbox <b>%s</b>",
      "schema.dependency.text.workflow_to_service_status" : "Wähle den Status des übergeordneten Services, welcher die Benachrichtigung untertrückt",
      "schema.user_chart.text.update" : "Einen Chart aktualisieren",
      "schema.roster.text.list" : "Übersicht über alle Bereitschaftspläne",
      "schema.service.text.view_wtrm_report" : "Web-Transaktionsreport einsehen",
      "err-800" : "Sorry, aber Sie dürfen nicht mehr als %s Service einrichten!",
      "site.help.doc.device-classes" : "Bauklasse von Hosts",
      "schema.user.attr.manage_templates" : "Verwaltung von Vorlagen?",
      "text.dashboard.hosts_availability" : "Verfügbarkeit aller Hosts",
      "schema.service.attr.comment" : "Kommentar",
      "schema.service.info.has_result" : "Dieser Service-Check hat erweiterte Statusinformationen. Klick mich :-)",
      "schema.user.text.new_password" : "Neues Passwort",
      "text.dashboard.services_downtimes" : "Geplante Wartungsarbeiten",
      "schema.service.info.flapping" : "Der Service wechselt zu häufig den Status.",
      "text.last_60d" : "Die letzten 60 Tage",
      "site.help.doc.host-alive-check" : "Was ist ein Host-Alive-Check?",
      "schema.contact.text.escalation_level_event.1" : "aktiv nach 1er Benachrichtiung",
      "action.close" : "Schließen",
      "schema.roster.attr.roster" : "Bereitschaftsplan",
      "schema.user_chart.desc.yaxis_label" : "Das Label der Y-Achse.",
      "schema.company.attr.company" : "Firma",
      "site.wtrm.command.doUserAgent" : "Set the user agent to <b>%s</b>",
      "schema.host.action.deactivate_multiple" : "Selektierte Hosts deaktivieren",
      "text.report.availability.Service" : "Klicke auf den Service für einen detaillierten Bericht",
      "action.yes_delete" : "<b>Ja, löschen!</b>",
      "schema.contact.attr.id" : "Kontakt ID",
      "schema.service.attr.command" : "Kommando",
      "action.help" : "Hilfe",
      "schema.event.text.host_service" : "Host / Service",
      "nav.sub.hosts" : "Hosts",
      "site.help.doc.json-api" : "Die Bloonix JSON API",
      "nav.main.notifications" : "BENACHRICHTIGUNGEN",
      "schema.contact.attr.mail_to" : "E-Mail",
      "schema.host_template.text.create" : "Ein neues Template erstellen",
      "schema.chart.attr.preset_last" : "Vorauswahl: letzte",
      "schema.event.attr.tags" : "Hinweise",
      "site.help.doc.scheduled-downtimes" : "Geplante Wartungsarbeiten einrichten",
      "schema.user.attr.timezone" : "Zeitzone",
      "action.display_from_to_rows" : "Anzeige %s-%s von %s Treffern",
      "schema.contactgroup.attr.description" : "Beschreibung",
      "site.wtrm.placeholder.ms" : "5000",
      "word.inactive" : "inaktiv",
      "site.wtrm.desc.hidden" : "Do you want to hide the value because it's a password or a secret string?",
      "schema.user.text.select_language" : "Wähle deine bevorzugte Sprache aus",
      "site.login.welcome" : "Willkommen bei Bloonix!",
      "schema.host_template.text.clone_title" : "Das Template %s klonen",
      "text.report.availability.h17" : "17:00 - 17:59",
      "schema.host.info.inactive" : "Der Host ist deaktiviert.",
      "schema.service.attr.interval" : "Intervall",
      "schema.service.action.multiple_force_next_check" : "Erzwinge den nächsten Check des Service",
      "schema.service.info.inactive" : "Der Service ist inaktiv.",
      "schema.user.text.delete" : "Den Benutzer löschen",
      "schema.service.text.select_location_check_type_info" : "Klicke auf die Buttons um eine kurze Beschreibung zu jedem Typ zu erhalten",
      "schema.service.attr.notification" : "Benachrichtigungen eingeschaltet",
      "site.wtrm.attr.userAgent" : "User-Agent",
      "schema.service.desc.failover_check_type_title" : "Failover Messpunkt",
      "schema.service.attr.sms_soft_interval" : "Benachrichtigungsintervall für SMS (soft)",
      "schema.user_chart.desc.subtitle" : "Der Untertitle des Chart.",
      "site.wtrm.command.doFill" : "Fill element <b>%s</b> with value <b>%s</b>",
      "schema.host.desc.coordinates" : "Der Standort des Hosts nach Länderkürzel.",
      "site.wtrm.action.checkIfElementIsSelected" : "Check if a <b>value</b> is <b>selected</b> in a selectbox",
      "text.undefined" : "Nicht definiert",
      "info.search_syntax" : "<p><b>Syntax der Suche:</b></p>\n<p>planet <i>AND</i> mars</p>\n<p>mars <i>OR</i> pluto</p>\n<p>planet <i>AND</i> mars <i>OR</i> pluto</p>",
      "schema.user.attr.authentication_key" : "Authentication Key",
      "word.Days" : "Tage",
      "text.never" : "Niemals",
      "text.report.availability.AV-W" : "Der Zeitbereich in Prozent in dem der Service im Status WARNING war.",
      "schema.chart.text.chart_views" : "Chart Ansichten",
      "schema.service.desc.active" : "Diese Option aktiviert oder deaktiviert den Service.",
      "schema.service.attr.command_options" : "Check Einstellungen",
      "schema.hs_downtime.attr.username" : "Erstellt von",
      "text.selected_objects" : "Ausgewählte Objekte",
      "schema.dependency.text.service_to_service" : "Service zu Service",
      "schema.service.action.deactivate_multiple" : "Selektierte Services deaktivieren",
      "word.Hours" : "Stunden"
   }
};// Init lang.
var Log = function() {};

Log.cache = [];
Log.level = "info";

Log.levelByName = {
    debug: 4,
    info: 3,
    warning: 2,
    error: 1,
    fatal: 0
};

Log.debug = function(msg) { Log.log("debug", msg) };
Log.info = function(msg) { Log.log("info", msg) };
Log.warning = function(msg) { Log.log("warning", msg) };
Log.error = function(msg) { Log.log("error", msg) };
Log.fatal = function(msg) { Log.log("fatal", msg) };

Log.log = function(level, msg) {
    if (Log.levelByName[level] <= Log.levelByName[Log.level]) {
        console.log(level +": ", msg);
    }
    if (Log.levelByName[level] < 3) {
        if (!Bloonix.forceScreen && Bloonix.objects.footerStats.Alerts) {
            Bloonix.objects.footerStats.Alerts.css({
                "font-weight": "bold",
                "color": "#ff0000"
            });
        }
        Log.cache.push({ level: level, message: msg });
        if (Log.cache.length > 20) {
            Log.cache.shift();
        }
    }
};
var Timezones = function() {
    return [
       {
          "value" : "Africa/Abidjan",
          "name" : "Africa/Abidjan"
       },
       {
          "value" : "Africa/Accra",
          "name" : "Africa/Accra"
       },
       {
          "value" : "Africa/Addis_Ababa",
          "name" : "Africa/Addis Ababa"
       },
       {
          "value" : "Africa/Algiers",
          "name" : "Africa/Algiers"
       },
       {
          "value" : "Africa/Asmara",
          "name" : "Africa/Asmara"
       },
       {
          "value" : "Africa/Bamako",
          "name" : "Africa/Bamako"
       },
       {
          "value" : "Africa/Bangui",
          "name" : "Africa/Bangui"
       },
       {
          "value" : "Africa/Banjul",
          "name" : "Africa/Banjul"
       },
       {
          "value" : "Africa/Bissau",
          "name" : "Africa/Bissau"
       },
       {
          "value" : "Africa/Blantyre",
          "name" : "Africa/Blantyre"
       },
       {
          "value" : "Africa/Brazzaville",
          "name" : "Africa/Brazzaville"
       },
       {
          "value" : "Africa/Bujumbura",
          "name" : "Africa/Bujumbura"
       },
       {
          "value" : "Africa/Cairo",
          "name" : "Africa/Cairo"
       },
       {
          "value" : "Africa/Casablanca",
          "name" : "Africa/Casablanca"
       },
       {
          "value" : "Africa/Ceuta",
          "name" : "Africa/Ceuta"
       },
       {
          "value" : "Africa/Conakry",
          "name" : "Africa/Conakry"
       },
       {
          "value" : "Africa/Dakar",
          "name" : "Africa/Dakar"
       },
       {
          "value" : "Africa/Dar_es_Salaam",
          "name" : "Africa/Dar es Salaam"
       },
       {
          "value" : "Africa/Djibouti",
          "name" : "Africa/Djibouti"
       },
       {
          "value" : "Africa/Douala",
          "name" : "Africa/Douala"
       },
       {
          "value" : "Africa/El_Aaiun",
          "name" : "Africa/El Aaiun"
       },
       {
          "value" : "Africa/Freetown",
          "name" : "Africa/Freetown"
       },
       {
          "value" : "Africa/Gaborone",
          "name" : "Africa/Gaborone"
       },
       {
          "value" : "Africa/Harare",
          "name" : "Africa/Harare"
       },
       {
          "value" : "Africa/Johannesburg",
          "name" : "Africa/Johannesburg"
       },
       {
          "value" : "Africa/Kampala",
          "name" : "Africa/Kampala"
       },
       {
          "value" : "Africa/Khartoum",
          "name" : "Africa/Khartoum"
       },
       {
          "value" : "Africa/Kigali",
          "name" : "Africa/Kigali"
       },
       {
          "value" : "Africa/Kinshasa",
          "name" : "Africa/Kinshasa"
       },
       {
          "value" : "Africa/Lagos",
          "name" : "Africa/Lagos"
       },
       {
          "value" : "Africa/Libreville",
          "name" : "Africa/Libreville"
       },
       {
          "value" : "Africa/Lome",
          "name" : "Africa/Lome"
       },
       {
          "value" : "Africa/Luanda",
          "name" : "Africa/Luanda"
       },
       {
          "value" : "Africa/Lubumbashi",
          "name" : "Africa/Lubumbashi"
       },
       {
          "value" : "Africa/Lusaka",
          "name" : "Africa/Lusaka"
       },
       {
          "value" : "Africa/Malabo",
          "name" : "Africa/Malabo"
       },
       {
          "value" : "Africa/Maputo",
          "name" : "Africa/Maputo"
       },
       {
          "value" : "Africa/Maseru",
          "name" : "Africa/Maseru"
       },
       {
          "value" : "Africa/Mbabane",
          "name" : "Africa/Mbabane"
       },
       {
          "value" : "Africa/Mogadishu",
          "name" : "Africa/Mogadishu"
       },
       {
          "value" : "Africa/Monrovia",
          "name" : "Africa/Monrovia"
       },
       {
          "value" : "Africa/Nairobi",
          "name" : "Africa/Nairobi"
       },
       {
          "value" : "Africa/Ndjamena",
          "name" : "Africa/Ndjamena"
       },
       {
          "value" : "Africa/Niamey",
          "name" : "Africa/Niamey"
       },
       {
          "value" : "Africa/Nouakchott",
          "name" : "Africa/Nouakchott"
       },
       {
          "value" : "Africa/Ouagadougou",
          "name" : "Africa/Ouagadougou"
       },
       {
          "value" : "Africa/Porto-Novo",
          "name" : "Africa/Porto-Novo"
       },
       {
          "value" : "Africa/Sao_Tome",
          "name" : "Africa/Sao Tome"
       },
       {
          "value" : "Africa/Tripoli",
          "name" : "Africa/Tripoli"
       },
       {
          "value" : "Africa/Tunis",
          "name" : "Africa/Tunis"
       },
       {
          "value" : "Africa/Windhoek",
          "name" : "Africa/Windhoek"
       },
       {
          "value" : "America/Adak",
          "name" : "America/Adak"
       },
       {
          "value" : "America/Anchorage",
          "name" : "America/Anchorage"
       },
       {
          "value" : "America/Anguilla",
          "name" : "America/Anguilla"
       },
       {
          "value" : "America/Antigua",
          "name" : "America/Antigua"
       },
       {
          "value" : "America/Araguaina",
          "name" : "America/Araguaina"
       },
       {
          "value" : "America/Argentina/Buenos_Aires",
          "name" : "America/Argentina/Buenos Aires"
       },
       {
          "value" : "America/Argentina/Catamarca",
          "name" : "America/Argentina/Catamarca"
       },
       {
          "value" : "America/Argentina/Cordoba",
          "name" : "America/Argentina/Cordoba"
       },
       {
          "value" : "America/Argentina/Jujuy",
          "name" : "America/Argentina/Jujuy"
       },
       {
          "value" : "America/Argentina/La_Rioja",
          "name" : "America/Argentina/La Rioja"
       },
       {
          "value" : "America/Argentina/Mendoza",
          "name" : "America/Argentina/Mendoza"
       },
       {
          "value" : "America/Argentina/Rio_Gallegos",
          "name" : "America/Argentina/Rio Gallegos"
       },
       {
          "value" : "America/Argentina/Salta",
          "name" : "America/Argentina/Salta"
       },
       {
          "value" : "America/Argentina/San_Juan",
          "name" : "America/Argentina/San Juan"
       },
       {
          "value" : "America/Argentina/San_Luis",
          "name" : "America/Argentina/San Luis"
       },
       {
          "value" : "America/Argentina/Tucuman",
          "name" : "America/Argentina/Tucuman"
       },
       {
          "value" : "America/Argentina/Ushuaia",
          "name" : "America/Argentina/Ushuaia"
       },
       {
          "value" : "America/Aruba",
          "name" : "America/Aruba"
       },
       {
          "value" : "America/Asuncion",
          "name" : "America/Asuncion"
       },
       {
          "value" : "America/Atikokan",
          "name" : "America/Atikokan"
       },
       {
          "value" : "America/Bahia",
          "name" : "America/Bahia"
       },
       {
          "value" : "America/Bahia_Banderas",
          "name" : "America/Bahia Banderas"
       },
       {
          "value" : "America/Barbados",
          "name" : "America/Barbados"
       },
       {
          "value" : "America/Belem",
          "name" : "America/Belem"
       },
       {
          "value" : "America/Belize",
          "name" : "America/Belize"
       },
       {
          "value" : "America/Blanc-Sablon",
          "name" : "America/Blanc-Sablon"
       },
       {
          "value" : "America/Boa_Vista",
          "name" : "America/Boa Vista"
       },
       {
          "value" : "America/Bogota",
          "name" : "America/Bogota"
       },
       {
          "value" : "America/Boise",
          "name" : "America/Boise"
       },
       {
          "value" : "America/Cambridge_Bay",
          "name" : "America/Cambridge Bay"
       },
       {
          "value" : "America/Campo_Grande",
          "name" : "America/Campo Grande"
       },
       {
          "value" : "America/Cancun",
          "name" : "America/Cancun"
       },
       {
          "value" : "America/Caracas",
          "name" : "America/Caracas"
       },
       {
          "value" : "America/Cayenne",
          "name" : "America/Cayenne"
       },
       {
          "value" : "America/Cayman",
          "name" : "America/Cayman"
       },
       {
          "value" : "America/Chicago",
          "name" : "America/Chicago"
       },
       {
          "value" : "America/Chihuahua",
          "name" : "America/Chihuahua"
       },
       {
          "value" : "America/Costa_Rica",
          "name" : "America/Costa Rica"
       },
       {
          "value" : "America/Cuiaba",
          "name" : "America/Cuiaba"
       },
       {
          "value" : "America/Curacao",
          "name" : "America/Curacao"
       },
       {
          "value" : "America/Danmarkshavn",
          "name" : "America/Danmarkshavn"
       },
       {
          "value" : "America/Dawson",
          "name" : "America/Dawson"
       },
       {
          "value" : "America/Dawson_Creek",
          "name" : "America/Dawson Creek"
       },
       {
          "value" : "America/Denver",
          "name" : "America/Denver"
       },
       {
          "value" : "America/Detroit",
          "name" : "America/Detroit"
       },
       {
          "value" : "America/Dominica",
          "name" : "America/Dominica"
       },
       {
          "value" : "America/Edmonton",
          "name" : "America/Edmonton"
       },
       {
          "value" : "America/Eirunepe",
          "name" : "America/Eirunepe"
       },
       {
          "value" : "America/El_Salvador",
          "name" : "America/El Salvador"
       },
       {
          "value" : "America/Fortaleza",
          "name" : "America/Fortaleza"
       },
       {
          "value" : "America/Glace_Bay",
          "name" : "America/Glace Bay"
       },
       {
          "value" : "America/Godthab",
          "name" : "America/Godthab"
       },
       {
          "value" : "America/Goose_Bay",
          "name" : "America/Goose Bay"
       },
       {
          "value" : "America/Grand_Turk",
          "name" : "America/Grand Turk"
       },
       {
          "value" : "America/Grenada",
          "name" : "America/Grenada"
       },
       {
          "value" : "America/Guadeloupe",
          "name" : "America/Guadeloupe"
       },
       {
          "value" : "America/Guatemala",
          "name" : "America/Guatemala"
       },
       {
          "value" : "America/Guayaquil",
          "name" : "America/Guayaquil"
       },
       {
          "value" : "America/Guyana",
          "name" : "America/Guyana"
       },
       {
          "value" : "America/Halifax",
          "name" : "America/Halifax"
       },
       {
          "value" : "America/Havana",
          "name" : "America/Havana"
       },
       {
          "value" : "America/Hermosillo",
          "name" : "America/Hermosillo"
       },
       {
          "value" : "America/Indiana/Indianapolis",
          "name" : "America/Indiana/Indianapolis"
       },
       {
          "value" : "America/Indiana/Knox",
          "name" : "America/Indiana/Knox"
       },
       {
          "value" : "America/Indiana/Marengo",
          "name" : "America/Indiana/Marengo"
       },
       {
          "value" : "America/Indiana/Petersburg",
          "name" : "America/Indiana/Petersburg"
       },
       {
          "value" : "America/Indiana/Tell_City",
          "name" : "America/Indiana/Tell City"
       },
       {
          "value" : "America/Indiana/Vevay",
          "name" : "America/Indiana/Vevay"
       },
       {
          "value" : "America/Indiana/Vincennes",
          "name" : "America/Indiana/Vincennes"
       },
       {
          "value" : "America/Indiana/Winamac",
          "name" : "America/Indiana/Winamac"
       },
       {
          "value" : "America/Inuvik",
          "name" : "America/Inuvik"
       },
       {
          "value" : "America/Iqaluit",
          "name" : "America/Iqaluit"
       },
       {
          "value" : "America/Jamaica",
          "name" : "America/Jamaica"
       },
       {
          "value" : "America/Juneau",
          "name" : "America/Juneau"
       },
       {
          "value" : "America/Kentucky/Louisville",
          "name" : "America/Kentucky/Louisville"
       },
       {
          "value" : "America/Kentucky/Monticello",
          "name" : "America/Kentucky/Monticello"
       },
       {
          "value" : "America/Kralendijk",
          "name" : "America/Kralendijk"
       },
       {
          "value" : "America/La_Paz",
          "name" : "America/La Paz"
       },
       {
          "value" : "America/Lima",
          "name" : "America/Lima"
       },
       {
          "value" : "America/Los_Angeles",
          "name" : "America/Los Angeles"
       },
       {
          "value" : "America/Lower_Princes",
          "name" : "America/Lower Princes"
       },
       {
          "value" : "America/Maceio",
          "name" : "America/Maceio"
       },
       {
          "value" : "America/Managua",
          "name" : "America/Managua"
       },
       {
          "value" : "America/Manaus",
          "name" : "America/Manaus"
       },
       {
          "value" : "America/Marigot",
          "name" : "America/Marigot"
       },
       {
          "value" : "America/Martinique",
          "name" : "America/Martinique"
       },
       {
          "value" : "America/Matamoros",
          "name" : "America/Matamoros"
       },
       {
          "value" : "America/Mazatlan",
          "name" : "America/Mazatlan"
       },
       {
          "value" : "America/Menominee",
          "name" : "America/Menominee"
       },
       {
          "value" : "America/Merida",
          "name" : "America/Merida"
       },
       {
          "value" : "America/Metlakatla",
          "name" : "America/Metlakatla"
       },
       {
          "value" : "America/Mexico_City",
          "name" : "America/Mexico City"
       },
       {
          "value" : "America/Miquelon",
          "name" : "America/Miquelon"
       },
       {
          "value" : "America/Moncton",
          "name" : "America/Moncton"
       },
       {
          "value" : "America/Monterrey",
          "name" : "America/Monterrey"
       },
       {
          "value" : "America/Montevideo",
          "name" : "America/Montevideo"
       },
       {
          "value" : "America/Montreal",
          "name" : "America/Montreal"
       },
       {
          "value" : "America/Montserrat",
          "name" : "America/Montserrat"
       },
       {
          "value" : "America/Nassau",
          "name" : "America/Nassau"
       },
       {
          "value" : "America/New_York",
          "name" : "America/New York"
       },
       {
          "value" : "America/Nipigon",
          "name" : "America/Nipigon"
       },
       {
          "value" : "America/Nome",
          "name" : "America/Nome"
       },
       {
          "value" : "America/Noronha",
          "name" : "America/Noronha"
       },
       {
          "value" : "America/North_Dakota/Beulah",
          "name" : "America/North Dakota/Beulah"
       },
       {
          "value" : "America/North_Dakota/Center",
          "name" : "America/North Dakota/Center"
       },
       {
          "value" : "America/North_Dakota/New_Salem",
          "name" : "America/North Dakota/New Salem"
       },
       {
          "value" : "America/Ojinaga",
          "name" : "America/Ojinaga"
       },
       {
          "value" : "America/Panama",
          "name" : "America/Panama"
       },
       {
          "value" : "America/Pangnirtung",
          "name" : "America/Pangnirtung"
       },
       {
          "value" : "America/Paramaribo",
          "name" : "America/Paramaribo"
       },
       {
          "value" : "America/Phoenix",
          "name" : "America/Phoenix"
       },
       {
          "value" : "America/Port-au-Prince",
          "name" : "America/Port-au-Prince"
       },
       {
          "value" : "America/Port_of_Spain",
          "name" : "America/Port of Spain"
       },
       {
          "value" : "America/Porto_Velho",
          "name" : "America/Porto Velho"
       },
       {
          "value" : "America/Puerto_Rico",
          "name" : "America/Puerto Rico"
       },
       {
          "value" : "America/Rainy_River",
          "name" : "America/Rainy River"
       },
       {
          "value" : "America/Rankin_Inlet",
          "name" : "America/Rankin Inlet"
       },
       {
          "value" : "America/Recife",
          "name" : "America/Recife"
       },
       {
          "value" : "America/Regina",
          "name" : "America/Regina"
       },
       {
          "value" : "America/Resolute",
          "name" : "America/Resolute"
       },
       {
          "value" : "America/Rio_Branco",
          "name" : "America/Rio Branco"
       },
       {
          "value" : "America/Santa_Isabel",
          "name" : "America/Santa Isabel"
       },
       {
          "value" : "America/Santarem",
          "name" : "America/Santarem"
       },
       {
          "value" : "America/Santiago",
          "name" : "America/Santiago"
       },
       {
          "value" : "America/Santo_Domingo",
          "name" : "America/Santo Domingo"
       },
       {
          "value" : "America/Sao_Paulo",
          "name" : "America/Sao Paulo"
       },
       {
          "value" : "America/Scoresbysund",
          "name" : "America/Scoresbysund"
       },
       {
          "value" : "America/Shiprock",
          "name" : "America/Shiprock"
       },
       {
          "value" : "America/Sitka",
          "name" : "America/Sitka"
       },
       {
          "value" : "America/St_Barthelemy",
          "name" : "America/St Barthelemy"
       },
       {
          "value" : "America/St_Johns",
          "name" : "America/St Johns"
       },
       {
          "value" : "America/St_Kitts",
          "name" : "America/St Kitts"
       },
       {
          "value" : "America/St_Lucia",
          "name" : "America/St Lucia"
       },
       {
          "value" : "America/St_Thomas",
          "name" : "America/St Thomas"
       },
       {
          "value" : "America/St_Vincent",
          "name" : "America/St Vincent"
       },
       {
          "value" : "America/Swift_Current",
          "name" : "America/Swift Current"
       },
       {
          "value" : "America/Tegucigalpa",
          "name" : "America/Tegucigalpa"
       },
       {
          "value" : "America/Thule",
          "name" : "America/Thule"
       },
       {
          "value" : "America/Thunder_Bay",
          "name" : "America/Thunder Bay"
       },
       {
          "value" : "America/Tijuana",
          "name" : "America/Tijuana"
       },
       {
          "value" : "America/Toronto",
          "name" : "America/Toronto"
       },
       {
          "value" : "America/Tortola",
          "name" : "America/Tortola"
       },
       {
          "value" : "America/Vancouver",
          "name" : "America/Vancouver"
       },
       {
          "value" : "America/Whitehorse",
          "name" : "America/Whitehorse"
       },
       {
          "value" : "America/Winnipeg",
          "name" : "America/Winnipeg"
       },
       {
          "value" : "America/Yakutat",
          "name" : "America/Yakutat"
       },
       {
          "value" : "America/Yellowknife",
          "name" : "America/Yellowknife"
       },
       {
          "value" : "Antarctica/Casey",
          "name" : "Antarctica/Casey"
       },
       {
          "value" : "Antarctica/Davis",
          "name" : "Antarctica/Davis"
       },
       {
          "value" : "Antarctica/DumontDUrville",
          "name" : "Antarctica/DumontDUrville"
       },
       {
          "value" : "Antarctica/Macquarie",
          "name" : "Antarctica/Macquarie"
       },
       {
          "value" : "Antarctica/Mawson",
          "name" : "Antarctica/Mawson"
       },
       {
          "value" : "Antarctica/McMurdo",
          "name" : "Antarctica/McMurdo"
       },
       {
          "value" : "Antarctica/Palmer",
          "name" : "Antarctica/Palmer"
       },
       {
          "value" : "Antarctica/Rothera",
          "name" : "Antarctica/Rothera"
       },
       {
          "value" : "Antarctica/South_Pole",
          "name" : "Antarctica/South Pole"
       },
       {
          "value" : "Antarctica/Syowa",
          "name" : "Antarctica/Syowa"
       },
       {
          "value" : "Antarctica/Vostok",
          "name" : "Antarctica/Vostok"
       },
       {
          "value" : "Arctic/Longyearbyen",
          "name" : "Arctic/Longyearbyen"
       },
       {
          "value" : "Asia/Aden",
          "name" : "Asia/Aden"
       },
       {
          "value" : "Asia/Almaty",
          "name" : "Asia/Almaty"
       },
       {
          "value" : "Asia/Amman",
          "name" : "Asia/Amman"
       },
       {
          "value" : "Asia/Anadyr",
          "name" : "Asia/Anadyr"
       },
       {
          "value" : "Asia/Aqtau",
          "name" : "Asia/Aqtau"
       },
       {
          "value" : "Asia/Aqtobe",
          "name" : "Asia/Aqtobe"
       },
       {
          "value" : "Asia/Ashgabat",
          "name" : "Asia/Ashgabat"
       },
       {
          "value" : "Asia/Baghdad",
          "name" : "Asia/Baghdad"
       },
       {
          "value" : "Asia/Bahrain",
          "name" : "Asia/Bahrain"
       },
       {
          "value" : "Asia/Baku",
          "name" : "Asia/Baku"
       },
       {
          "value" : "Asia/Bangkok",
          "name" : "Asia/Bangkok"
       },
       {
          "value" : "Asia/Beirut",
          "name" : "Asia/Beirut"
       },
       {
          "value" : "Asia/Bishkek",
          "name" : "Asia/Bishkek"
       },
       {
          "value" : "Asia/Brunei",
          "name" : "Asia/Brunei"
       },
       {
          "value" : "Asia/Choibalsan",
          "name" : "Asia/Choibalsan"
       },
       {
          "value" : "Asia/Chongqing",
          "name" : "Asia/Chongqing"
       },
       {
          "value" : "Asia/Colombo",
          "name" : "Asia/Colombo"
       },
       {
          "value" : "Asia/Damascus",
          "name" : "Asia/Damascus"
       },
       {
          "value" : "Asia/Dhaka",
          "name" : "Asia/Dhaka"
       },
       {
          "value" : "Asia/Dili",
          "name" : "Asia/Dili"
       },
       {
          "value" : "Asia/Dubai",
          "name" : "Asia/Dubai"
       },
       {
          "value" : "Asia/Dushanbe",
          "name" : "Asia/Dushanbe"
       },
       {
          "value" : "Asia/Gaza",
          "name" : "Asia/Gaza"
       },
       {
          "value" : "Asia/Harbin",
          "name" : "Asia/Harbin"
       },
       {
          "value" : "Asia/Ho_Chi_Minh",
          "name" : "Asia/Ho Chi Minh"
       },
       {
          "value" : "Asia/Hong_Kong",
          "name" : "Asia/Hong Kong"
       },
       {
          "value" : "Asia/Hovd",
          "name" : "Asia/Hovd"
       },
       {
          "value" : "Asia/Irkutsk",
          "name" : "Asia/Irkutsk"
       },
       {
          "value" : "Asia/Jakarta",
          "name" : "Asia/Jakarta"
       },
       {
          "value" : "Asia/Jayapura",
          "name" : "Asia/Jayapura"
       },
       {
          "value" : "Asia/Jerusalem",
          "name" : "Asia/Jerusalem"
       },
       {
          "value" : "Asia/Kabul",
          "name" : "Asia/Kabul"
       },
       {
          "value" : "Asia/Kamchatka",
          "name" : "Asia/Kamchatka"
       },
       {
          "value" : "Asia/Karachi",
          "name" : "Asia/Karachi"
       },
       {
          "value" : "Asia/Kashgar",
          "name" : "Asia/Kashgar"
       },
       {
          "value" : "Asia/Kathmandu",
          "name" : "Asia/Kathmandu"
       },
       {
          "value" : "Asia/Kolkata",
          "name" : "Asia/Kolkata"
       },
       {
          "value" : "Asia/Krasnoyarsk",
          "name" : "Asia/Krasnoyarsk"
       },
       {
          "value" : "Asia/Kuala_Lumpur",
          "name" : "Asia/Kuala Lumpur"
       },
       {
          "value" : "Asia/Kuching",
          "name" : "Asia/Kuching"
       },
       {
          "value" : "Asia/Kuwait",
          "name" : "Asia/Kuwait"
       },
       {
          "value" : "Asia/Macau",
          "name" : "Asia/Macau"
       },
       {
          "value" : "Asia/Magadan",
          "name" : "Asia/Magadan"
       },
       {
          "value" : "Asia/Makassar",
          "name" : "Asia/Makassar"
       },
       {
          "value" : "Asia/Manila",
          "name" : "Asia/Manila"
       },
       {
          "value" : "Asia/Muscat",
          "name" : "Asia/Muscat"
       },
       {
          "value" : "Asia/Nicosia",
          "name" : "Asia/Nicosia"
       },
       {
          "value" : "Asia/Novokuznetsk",
          "name" : "Asia/Novokuznetsk"
       },
       {
          "value" : "Asia/Novosibirsk",
          "name" : "Asia/Novosibirsk"
       },
       {
          "value" : "Asia/Omsk",
          "name" : "Asia/Omsk"
       },
       {
          "value" : "Asia/Oral",
          "name" : "Asia/Oral"
       },
       {
          "value" : "Asia/Phnom_Penh",
          "name" : "Asia/Phnom Penh"
       },
       {
          "value" : "Asia/Pontianak",
          "name" : "Asia/Pontianak"
       },
       {
          "value" : "Asia/Pyongyang",
          "name" : "Asia/Pyongyang"
       },
       {
          "value" : "Asia/Qatar",
          "name" : "Asia/Qatar"
       },
       {
          "value" : "Asia/Qyzylorda",
          "name" : "Asia/Qyzylorda"
       },
       {
          "value" : "Asia/Rangoon",
          "name" : "Asia/Rangoon"
       },
       {
          "value" : "Asia/Riyadh",
          "name" : "Asia/Riyadh"
       },
       {
          "value" : "Asia/Sakhalin",
          "name" : "Asia/Sakhalin"
       },
       {
          "value" : "Asia/Samarkand",
          "name" : "Asia/Samarkand"
       },
       {
          "value" : "Asia/Seoul",
          "name" : "Asia/Seoul"
       },
       {
          "value" : "Asia/Shanghai",
          "name" : "Asia/Shanghai"
       },
       {
          "value" : "Asia/Singapore",
          "name" : "Asia/Singapore"
       },
       {
          "value" : "Asia/Taipei",
          "name" : "Asia/Taipei"
       },
       {
          "value" : "Asia/Tashkent",
          "name" : "Asia/Tashkent"
       },
       {
          "value" : "Asia/Tbilisi",
          "name" : "Asia/Tbilisi"
       },
       {
          "value" : "Asia/Tehran",
          "name" : "Asia/Tehran"
       },
       {
          "value" : "Asia/Thimphu",
          "name" : "Asia/Thimphu"
       },
       {
          "value" : "Asia/Tokyo",
          "name" : "Asia/Tokyo"
       },
       {
          "value" : "Asia/Ulaanbaatar",
          "name" : "Asia/Ulaanbaatar"
       },
       {
          "value" : "Asia/Urumqi",
          "name" : "Asia/Urumqi"
       },
       {
          "value" : "Asia/Vientiane",
          "name" : "Asia/Vientiane"
       },
       {
          "value" : "Asia/Vladivostok",
          "name" : "Asia/Vladivostok"
       },
       {
          "value" : "Asia/Yakutsk",
          "name" : "Asia/Yakutsk"
       },
       {
          "value" : "Asia/Yekaterinburg",
          "name" : "Asia/Yekaterinburg"
       },
       {
          "value" : "Asia/Yerevan",
          "name" : "Asia/Yerevan"
       },
       {
          "value" : "Atlantic/Azores",
          "name" : "Atlantic/Azores"
       },
       {
          "value" : "Atlantic/Bermuda",
          "name" : "Atlantic/Bermuda"
       },
       {
          "value" : "Atlantic/Canary",
          "name" : "Atlantic/Canary"
       },
       {
          "value" : "Atlantic/Cape_Verde",
          "name" : "Atlantic/Cape Verde"
       },
       {
          "value" : "Atlantic/Faroe",
          "name" : "Atlantic/Faroe"
       },
       {
          "value" : "Atlantic/Madeira",
          "name" : "Atlantic/Madeira"
       },
       {
          "value" : "Atlantic/Reykjavik",
          "name" : "Atlantic/Reykjavik"
       },
       {
          "value" : "Atlantic/South_Georgia",
          "name" : "Atlantic/South Georgia"
       },
       {
          "value" : "Atlantic/St_Helena",
          "name" : "Atlantic/St Helena"
       },
       {
          "value" : "Atlantic/Stanley",
          "name" : "Atlantic/Stanley"
       },
       {
          "value" : "Australia/Adelaide",
          "name" : "Australia/Adelaide"
       },
       {
          "value" : "Australia/Brisbane",
          "name" : "Australia/Brisbane"
       },
       {
          "value" : "Australia/Broken_Hill",
          "name" : "Australia/Broken Hill"
       },
       {
          "value" : "Australia/Currie",
          "name" : "Australia/Currie"
       },
       {
          "value" : "Australia/Darwin",
          "name" : "Australia/Darwin"
       },
       {
          "value" : "Australia/Eucla",
          "name" : "Australia/Eucla"
       },
       {
          "value" : "Australia/Hobart",
          "name" : "Australia/Hobart"
       },
       {
          "value" : "Australia/Lindeman",
          "name" : "Australia/Lindeman"
       },
       {
          "value" : "Australia/Lord_Howe",
          "name" : "Australia/Lord Howe"
       },
       {
          "value" : "Australia/Melbourne",
          "name" : "Australia/Melbourne"
       },
       {
          "value" : "Australia/Perth",
          "name" : "Australia/Perth"
       },
       {
          "value" : "Australia/Sydney",
          "name" : "Australia/Sydney"
       },
       {
          "value" : "Europe/Amsterdam",
          "name" : "Europe/Amsterdam"
       },
       {
          "value" : "Europe/Andorra",
          "name" : "Europe/Andorra"
       },
       {
          "value" : "Europe/Athens",
          "name" : "Europe/Athens"
       },
       {
          "value" : "Europe/Belgrade",
          "name" : "Europe/Belgrade"
       },
       {
          "value" : "Europe/Berlin",
          "name" : "Europe/Berlin"
       },
       {
          "value" : "Europe/Bratislava",
          "name" : "Europe/Bratislava"
       },
       {
          "value" : "Europe/Brussels",
          "name" : "Europe/Brussels"
       },
       {
          "value" : "Europe/Bucharest",
          "name" : "Europe/Bucharest"
       },
       {
          "value" : "Europe/Budapest",
          "name" : "Europe/Budapest"
       },
       {
          "value" : "Europe/Chisinau",
          "name" : "Europe/Chisinau"
       },
       {
          "value" : "Europe/Copenhagen",
          "name" : "Europe/Copenhagen"
       },
       {
          "value" : "Europe/Dublin",
          "name" : "Europe/Dublin"
       },
       {
          "value" : "Europe/Gibraltar",
          "name" : "Europe/Gibraltar"
       },
       {
          "value" : "Europe/Guernsey",
          "name" : "Europe/Guernsey"
       },
       {
          "value" : "Europe/Helsinki",
          "name" : "Europe/Helsinki"
       },
       {
          "value" : "Europe/Isle_of_Man",
          "name" : "Europe/Isle of Man"
       },
       {
          "value" : "Europe/Istanbul",
          "name" : "Europe/Istanbul"
       },
       {
          "value" : "Europe/Jersey",
          "name" : "Europe/Jersey"
       },
       {
          "value" : "Europe/Kaliningrad",
          "name" : "Europe/Kaliningrad"
       },
       {
          "value" : "Europe/Kiev",
          "name" : "Europe/Kiev"
       },
       {
          "value" : "Europe/Lisbon",
          "name" : "Europe/Lisbon"
       },
       {
          "value" : "Europe/Ljubljana",
          "name" : "Europe/Ljubljana"
       },
       {
          "value" : "Europe/London",
          "name" : "Europe/London"
       },
       {
          "value" : "Europe/Luxembourg",
          "name" : "Europe/Luxembourg"
       },
       {
          "value" : "Europe/Madrid",
          "name" : "Europe/Madrid"
       },
       {
          "value" : "Europe/Malta",
          "name" : "Europe/Malta"
       },
       {
          "value" : "Europe/Mariehamn",
          "name" : "Europe/Mariehamn"
       },
       {
          "value" : "Europe/Minsk",
          "name" : "Europe/Minsk"
       },
       {
          "value" : "Europe/Monaco",
          "name" : "Europe/Monaco"
       },
       {
          "value" : "Europe/Moscow",
          "name" : "Europe/Moscow"
       },
       {
          "value" : "Europe/Oslo",
          "name" : "Europe/Oslo"
       },
       {
          "value" : "Europe/Paris",
          "name" : "Europe/Paris"
       },
       {
          "value" : "Europe/Podgorica",
          "name" : "Europe/Podgorica"
       },
       {
          "value" : "Europe/Prague",
          "name" : "Europe/Prague"
       },
       {
          "value" : "Europe/Riga",
          "name" : "Europe/Riga"
       },
       {
          "value" : "Europe/Rome",
          "name" : "Europe/Rome"
       },
       {
          "value" : "Europe/Samara",
          "name" : "Europe/Samara"
       },
       {
          "value" : "Europe/San_Marino",
          "name" : "Europe/San Marino"
       },
       {
          "value" : "Europe/Sarajevo",
          "name" : "Europe/Sarajevo"
       },
       {
          "value" : "Europe/Simferopol",
          "name" : "Europe/Simferopol"
       },
       {
          "value" : "Europe/Skopje",
          "name" : "Europe/Skopje"
       },
       {
          "value" : "Europe/Sofia",
          "name" : "Europe/Sofia"
       },
       {
          "value" : "Europe/Stockholm",
          "name" : "Europe/Stockholm"
       },
       {
          "value" : "Europe/Tallinn",
          "name" : "Europe/Tallinn"
       },
       {
          "value" : "Europe/Tirane",
          "name" : "Europe/Tirane"
       },
       {
          "value" : "Europe/Uzhgorod",
          "name" : "Europe/Uzhgorod"
       },
       {
          "value" : "Europe/Vaduz",
          "name" : "Europe/Vaduz"
       },
       {
          "value" : "Europe/Vatican",
          "name" : "Europe/Vatican"
       },
       {
          "value" : "Europe/Vienna",
          "name" : "Europe/Vienna"
       },
       {
          "value" : "Europe/Vilnius",
          "name" : "Europe/Vilnius"
       },
       {
          "value" : "Europe/Volgograd",
          "name" : "Europe/Volgograd"
       },
       {
          "value" : "Europe/Warsaw",
          "name" : "Europe/Warsaw"
       },
       {
          "value" : "Europe/Zagreb",
          "name" : "Europe/Zagreb"
       },
       {
          "value" : "Europe/Zaporozhye",
          "name" : "Europe/Zaporozhye"
       },
       {
          "value" : "Europe/Zurich",
          "name" : "Europe/Zurich"
       },
       {
          "value" : "Indian/Antananarivo",
          "name" : "Indian/Antananarivo"
       },
       {
          "value" : "Indian/Chagos",
          "name" : "Indian/Chagos"
       },
       {
          "value" : "Indian/Christmas",
          "name" : "Indian/Christmas"
       },
       {
          "value" : "Indian/Cocos",
          "name" : "Indian/Cocos"
       },
       {
          "value" : "Indian/Comoro",
          "name" : "Indian/Comoro"
       },
       {
          "value" : "Indian/Kerguelen",
          "name" : "Indian/Kerguelen"
       },
       {
          "value" : "Indian/Mahe",
          "name" : "Indian/Mahe"
       },
       {
          "value" : "Indian/Maldives",
          "name" : "Indian/Maldives"
       },
       {
          "value" : "Indian/Mauritius",
          "name" : "Indian/Mauritius"
       },
       {
          "value" : "Indian/Mayotte",
          "name" : "Indian/Mayotte"
       },
       {
          "value" : "Indian/Reunion",
          "name" : "Indian/Reunion"
       },
       {
          "value" : "Pacific/Apia",
          "name" : "Pacific/Apia"
       },
       {
          "value" : "Pacific/Auckland",
          "name" : "Pacific/Auckland"
       },
       {
          "value" : "Pacific/Chatham",
          "name" : "Pacific/Chatham"
       },
       {
          "value" : "Pacific/Chuuk",
          "name" : "Pacific/Chuuk"
       },
       {
          "value" : "Pacific/Easter",
          "name" : "Pacific/Easter"
       },
       {
          "value" : "Pacific/Efate",
          "name" : "Pacific/Efate"
       },
       {
          "value" : "Pacific/Enderbury",
          "name" : "Pacific/Enderbury"
       },
       {
          "value" : "Pacific/Fakaofo",
          "name" : "Pacific/Fakaofo"
       },
       {
          "value" : "Pacific/Fiji",
          "name" : "Pacific/Fiji"
       },
       {
          "value" : "Pacific/Funafuti",
          "name" : "Pacific/Funafuti"
       },
       {
          "value" : "Pacific/Galapagos",
          "name" : "Pacific/Galapagos"
       },
       {
          "value" : "Pacific/Gambier",
          "name" : "Pacific/Gambier"
       },
       {
          "value" : "Pacific/Guadalcanal",
          "name" : "Pacific/Guadalcanal"
       },
       {
          "value" : "Pacific/Guam",
          "name" : "Pacific/Guam"
       },
       {
          "value" : "Pacific/Honolulu",
          "name" : "Pacific/Honolulu"
       },
       {
          "value" : "Pacific/Johnston",
          "name" : "Pacific/Johnston"
       },
       {
          "value" : "Pacific/Kiritimati",
          "name" : "Pacific/Kiritimati"
       },
       {
          "value" : "Pacific/Kosrae",
          "name" : "Pacific/Kosrae"
       },
       {
          "value" : "Pacific/Kwajalein",
          "name" : "Pacific/Kwajalein"
       },
       {
          "value" : "Pacific/Majuro",
          "name" : "Pacific/Majuro"
       },
       {
          "value" : "Pacific/Marquesas",
          "name" : "Pacific/Marquesas"
       },
       {
          "value" : "Pacific/Midway",
          "name" : "Pacific/Midway"
       },
       {
          "value" : "Pacific/Nauru",
          "name" : "Pacific/Nauru"
       },
       {
          "value" : "Pacific/Niue",
          "name" : "Pacific/Niue"
       },
       {
          "value" : "Pacific/Norfolk",
          "name" : "Pacific/Norfolk"
       },
       {
          "value" : "Pacific/Noumea",
          "name" : "Pacific/Noumea"
       },
       {
          "value" : "Pacific/Pago_Pago",
          "name" : "Pacific/Pago Pago"
       },
       {
          "value" : "Pacific/Palau",
          "name" : "Pacific/Palau"
       },
       {
          "value" : "Pacific/Pitcairn",
          "name" : "Pacific/Pitcairn"
       },
       {
          "value" : "Pacific/Pohnpei",
          "name" : "Pacific/Pohnpei"
       },
       {
          "value" : "Pacific/Port_Moresby",
          "name" : "Pacific/Port Moresby"
       },
       {
          "value" : "Pacific/Rarotonga",
          "name" : "Pacific/Rarotonga"
       },
       {
          "value" : "Pacific/Saipan",
          "name" : "Pacific/Saipan"
       },
       {
          "value" : "Pacific/Tahiti",
          "name" : "Pacific/Tahiti"
       },
       {
          "value" : "Pacific/Tarawa",
          "name" : "Pacific/Tarawa"
       },
       {
          "value" : "Pacific/Tongatapu",
          "name" : "Pacific/Tongatapu"
       },
       {
          "value" : "Pacific/Wake",
          "name" : "Pacific/Wake"
       },
       {
          "value" : "Pacific/Wallis",
          "name" : "Pacific/Wallis"
       }
    ];
};
var Bloonix = function(o) {
    var B = Utils.extend({
        appendTo: "body",
        postdata: {
            offset: 0,
            limit: 10
        }
    });

    B.init = function() {
        this.createHeaderBox();
        this.createContentBox();
        this.loadDashboard();
    };

    B.createHeaderBox = function() {
        this.headerBox = Utils.create("div")
            .attr("id", "header")
            .appendTo(this.appendTo);

        this.navIcon = Utils.create("div")
            .attr("id", "nav-icon")
            .addClass("gicons-gray gicons justify")
            .appendTo(this.headerBox);

        this.logo = Utils.create("div")
            .attr("id", "logo")
            .appendTo(this.headerBox);

        Utils.create("img")
            .attr("src", "/public/img/Bloonix-Black-3.png")
            .attr("alt", "Bloonix")
            .appendTo(this.logo);

        this.logoutIcon = Utils.create("div")
            .attr("id", "logout-icon")
            .addClass("gicons-gray gicons power pointer")
            .appendTo(this.headerBox);

        this.logoutIcon.click(function() {
            window.location = "/logout";
        });
    };

    B.createContentBox = function() {
        this.contentBox = Utils.create("div")
            .attr("id", "content")
            .appendTo(this.appendTo);
    };

    B.loadDashboard = function() {
        var self = this;

        Ajax.post({
            url: "/hosts/stats/status",
            success: function(response) {
                var table = new Table({
                    width: "100%"
                }).create();

                $.each([ "UNKNOWN", "CRITICAL", "WARNING", "INFO", "OK" ], function(i, status) {
                    table.addRow({
                        columns: [
                            { value: response.data[status] +" "+ status, addClass: "column-"+ status },
                        ]
                    });
                });
            }
        });
    };

    return B;
};

var Table = function(o) {
    var T = Utils.extend({
        appendTo: "#content",
        addClass: "maintab"
    }, o);

    T.create = function() {
        this.table = Utils.create("table");

        if (this.width) {
            this.table.css({ width: this.width });
        }

        if (this.addClass) {
            this.table.addClass(this.addClass);
        }

        if (this.appendTo) {
            this.table.appendTo(this.appendTo);
        }

        return this;
    };

    T.addRow = function(o) {
        var row = { td: [] };

        row.tr = Utils.create("tr")
            .appendTo(this.table);

        $.each(o.columns, function(i, column) {
            var td = Utils.create("td")
                .html(column.value)
                .appendTo(row.tr);

            if (column.addClass) {
                td.addClass(column.addClass);
            }

            row.td.push(td);
        });

        return row;
    };

    return T;
};

// Expose the Bloonix object as global.
window.Bloonix = Bloonix;

// End of encapsulation.
})();
