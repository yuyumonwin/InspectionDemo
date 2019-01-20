Config.appid = "mockup_inspection";
Config.version = "136";
Config.title = "Inspection Demo";
Config.uses = "NovadeTrack";
Config.beta = "1";

Config.tables["comments"] = "id;owner;projectid;defectid;caseid;inspectionid;comment;date DATE;type INTEGER;deletedby";

Config.tables["inspectiontypes"] = "id;name;templateids;"; // one template mandatory
Config.tables["inspections"] = "id;name;unitids;typeid;parentid;status INTEGER;lodgedby;assignee;owner;date DATE;scheduledate DATE;startdate DATE;closingdate DATE;closedby;rejecteddate DATE;rejectedby;formids;fileids;";

function leftpane () {
    List.show();
}

function main() {

    var version = Config.version;
    App.alert("Come here " + version);

    // if (User.getName() == "yuyumonwin") App.alert("This is Maincon");
    // else App.alert("This is Inspector")

    var data = getInspectionData();

    if (WEB()) {
        List.addItem("Inspections", "viewInspectionGroups()", "img:inspection;icon:arrow");
        List.addItem("Inspection Types", "viewInspectionTypes()", "img:job;icon:arrow");
    } else {

        Toolbar.addButton("Add New Inspection", "selectUnit('32', 'B', '02')", "new");

        var userName = User.getName();
        var inspections = Query.select("inspections", "*", "owner CONTAINS {userName}");

        if (userName == "yuyumonwin") { // This is Admin. Should be Maincon/subcon account to test
            // var insp = Query.select("inspections", "*", "owner CONTAINS {User.getName()}", "date");
            // List.addItem("All", "viewMobileInspections('all')", "img:job;count:" + data.all);
            // List.addItem("Draft", "viewMobileInspections('new')", "img:edit;count:" + data.new);
            // List.addItem("Pending Approval", "viewMobileInspections('pending')", "img:inspection;count:" + data.pending);
            // List.addItem("Work In Progress", "viewMobileInspections('wip')", "img:job;count:" + data.wip);
            // List.addItem("Rejected", "viewMobileInspections('rejected')", "img:pause;count:" + data.rejected)

            // List.addHeader("");
            // List.addItem("Done", "viewMobileInspections('done')", "img:inspection;count:" + data.done);

        } else { // this should be consultant account
        
            // List.addItem("All", "viewMobileInspections('all')", "img:job;count:" + data.all);
            List.addItem("In Progress", "viewMobileInspections('wip')", "img:clock;count:" + data.wip);
            List.addItem("Overdue", "viewMobileInspections('overdue')", "img:clock;count:" + data.overdue);
            List.addItem("To Assign", "viewMobileInspections('toassign')", "img:group;count:" + data.toassign);
            List.addItem("Today", "viewMobileInspections('today')", "img:edit;count:" + data.today);
            List.addItem("Tomorrow", "viewMobileInspections('tomorrow')", "img:extendtime;count:" + data.tomorrow);

            List.addHeader("");
            List.addItem("Scheduled", "viewMobileInspections('schedule')", "img:calendar;count:" + data.schedule);
            List.addItem("Done", "viewMobileInspections('done')", "img:inspection;count:" + data.done);
            List.addItem("Rejected", "viewMobileInspections('rejected')", "img:pause;count:" + data.rejected)
        }
    }
    List.show();
}

var NEW = 0;
var WIP = 1;
var CLOSED = 2;
var REJECTED = -1;


function getInspectionData () {
    var userName = User.getName();
    var inspections = Query.select("inspections", "*", "owner CONTAINS {userName}", "date");

    var data = {};
    data.all = inspections.length;
    data.allData = inspections;
    data.new = 0;
    data.newData = [];
    data.rejected = 0;
    data.rejectedData = [];
    data.done = 0;
    data.doneData = [];
    data.wip = 0;
    data.wipData = [];
    data.overdue = 0;
    data.overdueData = [];
    data.today = 0;
    data.todayData = [];
    data.tomorrow = 0;
    data.tomorrowData = [];
    data.schedule = 0;
    data.scheduleData = [];
    data.pending = 0;
    data.pendingData = [];
    data.toassign = 0;
    data.toassignData = [];

    var today = Date.today();
    var tomorrow = Date.addDays(today, 1);
    var nextDay = Date.addDays(tomorrow, 1);

    inspections.forEach(function (inspection) {
        if (!inspection.assignee) {
            data.toassign++;
            data.toassignData.push(inspection);
        } else if (inspection.assignee == User.getName()) {
            var scheduledate = inspection.scheduledate;
            if (inspection.status == NEW) {
                data.new++;
                data.newData.push(inspection);

                if (scheduledate < today) {
                    data.overdue++;
                    data.overdueData.push(inspection);
                }
                else if (scheduledate >= today && scheduledate < tomorrow) {
                    data.today++;
                    data.todayData.push(inspection);
                }
                else if (scheduledate >= tomorrow && scheduledate < nextDay) {
                    data.tomorrow++;
                    data.schedule++;
                    data.tomorrowData.push(inspection);
                    data.scheduleData.push(inspection);
                }
                else {
                    data.schedule++;
                    data.scheduleData.push(inspection);
                }
            } else if (inspection.status == WIP) {
                data.wip++;
                data.wipData.push(inspection);
                if (scheduledate >= today && scheduledate < tomorrow) {
                    data.today++;
                    data.todayData.push(inspection);
                }

            } else if (inspection.status == CLOSED) {
                data.done++;
                data.doneData.push(inspection);
    
            } else if (inspection.status == REJECTED) {
                data.rejected++;
                data.rejectedData.push(inspection);
            }
        }
    });
    return data;
}

function getColor(status) {
    if (status == NEW) return '#F47119';
    else if (status == WIP) return '#EAA60F';
    else if (status == CLOSED) return '#7EC141';
    else if (status == REJECTED) return "#E54D39";
    else return "";
}

function viewMobileInspections (status) {
    var data = getInspectionData();

    var inspections = [];
    if (status == "all") {
        inspections = data.allData;
    } else if (status == "overdue") {
        inspections = data.overdueData;
    } else if (status == "today") {
        inspections = data.todayData;
    } else if (status == "tomorrow") {
        inspections = data.tomorrowData;
    } else if (status == "schedule") {
        inspections = data.scheduleData;
    } else if (status == "done") {
        inspections = data.doneData;
    } else if (status == "new") {
        inspections = data.newData;
    } else if (status == "wip") {
        inspections = data.wipData;
    } else if (status == "rejected") {
        inspections = data.rejectedData;
    } else if (status == "pending") {
        inspections = data.pendingData;
    } else if (status == "toassign") {
        inspections = data.toassignData;
    }

    inspections.forEach(function (inspection) {
        List.addItem(inspection.name, "viewInspection({inspection.id})", "img:inspection");
    });
    List.show();
}

function viewInspectionTypes () {
    Toolbar.addButton("Add New Inspection Type", "newInspectionType()", "new");
    List.addItemTitle("Inspection Types");
    var types = Query.select("inspectiontypes");
    types.forEach(function(type) {
        List.addItem(type.name, "editInspectionType({type.id})", "img:activities");
    });
    List.show();
}

function viewInspectionGroups () {
    Toolbar.addButton("Add New Inspection", "selectUnit('32', 'B', '02')", "new");
    List.addItemTitle("Inspections By Types")

    var inspections = Query.selectDistinct("inspections", "typeid");
    inspections.forEach(function (inspection) {
        var type = Query.selectId("inspectiontypes", inspection.typeid);
        var count = Query.count("inspections", "typeid={inspection.typeid}");
        List.addItemSubtitle(type.name, "Total Inspections - " + count, "viewInspections({type.id})", "img:activities");
    });
    List.show();
}

function viewInspections (typeid) {
    if (typeid) {

        var type = Query.selectId("inspectiontypes", typeid);
        List.addItemTitle("Inspections", "Type - " + type.name);

        var inspections = Query.select("inspections", "*", "typeid={typeid} AND owner CONTAINS {User.getName()}");
        inspections.forEach(function (inspection) {
            List.addItem(inspection.name, "viewInspection({inspection.id})", "img:inspection");
        });
    } else {
        var inspections = Query.select("inspections", "*", "owner CONTAINS {User.getName()}", "date");
        inspections.forEach(function (inspection) {
            List.addItem(inspection.name, "viewInspection({inspection.id})", "img:inspection");
        });
    }
    List.show();
}

function selectUnit (projectid, block, level, histToRemove) { // Remove history
    if (!histToRemove) histToRemove = 0;
    histToRemove = histToRemove + 1;
    var unit, units = Query.select("novadetrack.units", "id;name;typeid;rank", "projectid={projectid} AND block={block} AND level={level}", "name");
    if (units.length == 1) {
        unit = units[0];
        return showPopupInspectionType(unit.id, histToRemove);
    }
    for (var i = 0; i < units.length; i++) {
        unit = units[i];
        List.addItem(unit.name, "showPopupInspectionType({unit.id}, {histToRemove})");
    }
    List.show();
}

function showPopupInspectionType (unitid, histToRemove) {
    histToRemove = histToRemove? histToRemove + 1: 1;
    var types = Query.select("inspectiontypes");
    types.forEach(function (type) {
        List.addItem(type.name, "newInspection({type.id}, {unitid}, {histToRemove})");
    });
    List.show();
}

function viewInspection (id, tab) {
    var inspection = Query.selectId("inspections", id);

    Toolbar.setColor(getColor(inspection.status))

    var status = "New";
    if (inspection.status == WIP) {
        status = "In Progress";
    } else if (inspection.status == CLOSED) {
        status = "Closed";
    } else if (inspection.status == REJECTED) {
        status = "Failed";
    }
    List.addTitle(inspection.name, status)
    var userName = User.getName();

    Toolbar.addTab("Info", "viewInspection({id})");
    if (inspection.formids) Toolbar.addTab("Forms", "viewInspection({id}, 'forms')");

    if (!tab) {
        if (inspection.status != CLOSED && inspection.status != REJECTED) Toolbar.addButton("Edit", "editInspection({id})", "edit");
        var unit = Query.selectId("novadetrack.units", inspection.unitids);
        var completeLocation = [];
        if (unit) {
            if (unit.block) completeLocation.push(unit.block);
            if (unit.level) completeLocation.push(unit.level);
            completeLocation.push(unit.name);
        }
        List.addItemSubtitle("Unit", completeLocation.join(", "), "", "img:company")
        var type = Query.selectId("inspectiontypes", inspection.typeid);
        List.addItemSubtitle("Type", type.name, "", "img:activities");
        List.addItemSubtitle("Scheduled Date", Format.date(inspection.scheduledate), "", "img:calendar");
        List.addItemSubtitle("Assignee To", inspection.assignee, "", "img:group");

        if (inspection.status == NEW && inspection.assignee == userName) {
            List.addButton("Start", "startInspection({id})", "color:" + getColor(NEW));
        } else if (inspection.status == WIP && inspection.assignee == userName) {
            List.addButton("Close", "closeInspection({id})", "color:" + getColor(CLOSED));
            List.addButton("Mark As Fail", "rejectInspection({id})", "color:" + getColor(REJECTED));
        }

        writeInspectionPhotos(id);
        if (inspection.status != REJECTED) List.addButton("Add Photo", "takePix({id})", "color:gray")
        writeComments(id);
        if (inspection.status != REJECTED) List.addButton("Add Comment", "addComment({id})", "color:gray")
    } else {
        var formids = (inspection.formids)? inspection.formids.split("|"): [];

        formids.forEach(function (formid) {
            var form = Query.selectId("Forms.forms", formid);
            List.addItem(form.name, "NovadeTrack.viewForm({formid})");
        });
    }
    List.show();
}

function startInspection (id) {
    var inspection = Query.selectId("inspections", id);
    if (!App.confirm("Do you want to start inspection")) return;
    Query.updateId("inspections", id, "status", WIP);
    Query.updateId("inspections", id, "startdate", Date.now());
    History.remove(2);
    History.redirect("viewInspection({id})");
}

function closeInspection (id) {
    var inspection = Query.selectId("inspections", id);
    var formids = inspection.formids;
    if (!App.confirm("Do you want to close this inspection")) return;

    var failToCloseInspection = false;
    formids = formids? formids.split("|"): [];
    formids.forEach(function (formid) {
        var form = Query.selectId("Forms.forms", formid);
        if (form.status != 1) { // This is going to change to check last stage of the form. 
           failToCloseInspection = true;
        }
    });

    if (failToCloseInspection) {
        App.alert("Please finish checklists before closing the inspection.");
    } else {
        Query.updateId("inspections", id, "closingdate", Date.now());
        Query.updateId("inspections", id, "closedby", User.getName());
        Query.updateId("inspections", id, "status", CLOSED);

        History.remove(2);
        History.redirect("viewInspection({id})");
    }
}

function rejectInspection (inspectionid) {
    var reason = App.prompt("Please enter a reason", "");
    if (!reason) return App.alert("Reason cannot be empty.");

    var commentid = Query.insert("comments", {
        date: Date.now(),
        comment: "Rejected Reason: " + reason,
        type: 1,
        owner: User.getName(),
        inspectionid: inspectionid
    });

    var inspection = Query.selectId("inspections", inspectionid);
    var formids = inspection.formids;

    formids = formids? formids.split("|"): [];
    formids.forEach(function (formid) {
        customRejectForm(formid, reason);
    });
    Query.updateId("inspections", inspectionid, "status", REJECTED);
    Query.updateId("inspections", inspectionid, "rejecteddate", Date.now());
    Query.updateId("inspections", inspectionid, "rejectedby", User.getName());

    // Notifications
    History.remove(2);
    History.redirect("viewInspection({inspectionid})");
}


function writeComments (id) {
    Format.forprint();
    var comments = Query.select("comments", "*", "inspectionid={id}");
    if (comments.length) List.addHeader("Comments");
    comments.forEach(function(comment) {
        List.addItemSubtitle(Format.text(comment.comment), Format.date(comment.date) + ", " + comment.owner, "");
    });
}

function addComment (id) {
    var reason = App.prompt("Add Comment", "");
    if (!reason) return "";

    var comment = {
        date: Date.now(),
        comment: Format.text(reason),
        inspectionid: id
    }
    var id = Query.insert("comments", comment);
    History.reload();
}

function writeInspectionPhotos (id) {
    var inspection = Query.selectId("inspections", id);
    var photos = Query.select("System.files", "id", "linkedtable='inspections' AND linkedrecid={id}");
    if (photos.length) List.addHeader("Photos");
    for (var i = 0; i < photos.length; i++) {
        var file = photos[i];
        var img = Settings.getFileUrl(file.id);
        List.addItem(file.name, "", "scale:crop;img:" + img);

        if (file.description) {
            var owner = file.owner.split("|")[0];
            if (isAdmin || userName == owner) List.addItemLabel(R.DESCRIPTION, file.description, "editPhotoDescription({file.id})", "icon:arrow");
            else List.addItemLabel(R.DESCRIPTION, file.description, null, null);
        }
    }
}

function takePix(id) {
    App.takePicture('inspections', id, null, "");
}

function newInspection (typeid, unitid, histToRemove) {
    History.remove(parseInt(histToRemove));
    var type = Query.selectId("inspectiontypes", typeid);

    var userName = User.getName();
    var count = Query.count("mockup_inspection.inspections", "typeid={typeid}") + 1;
    var inspection = {
        name: type.name + " " + count,
        unitids: unitid,
        status: NEW,
        typeid: typeid,
        date: Date.now(),
        scheduledate: Date.now(),
        owner: userName,
        lodgedby: userName,
        assignee: userName
    }
    var id = Query.insert("mockup_inspection.inspections", inspection);
    var templateids = type.templateids? type.templateids.split("|"): [];


    if (templateids.length) {
        var count = 0;
        templateids.forEach(function (templateid) {
            var template = Query.selectId("Forms.templates", templateid);
            var formid = newFormInternal(type.templateids, "inspections", id, null, template.name + " 1");
            Query.updateId("inspections", id, "formids", formid);
        });
    }

    History.add("viewInspection({id})");
    History.redirect("editInspection({id})");
}

function editInspection (id) {
    Toolbar.addButton("DELETE", "deleteInspection({id})", "delete");
    List.addItemTitle("Edit Inspection");

    var inspection = Query.selectId("inspections", id);

    var onchange = "Query.updateId('inspections',{id}, this.id, this.value);History.reload()";

    List.addTextBox("name", "Name", inspection.name, onchange);
    List.addTextBox("scheduledate", "Schedule Date", inspection.scheduledate, onchange, "date")

    var allAssignees = Query.select("novaderesources.people");
    allAssignees = allAssignees.filter(function(as) { return MultiValue.contains(as.projectids, "32"); });

    var options = allAssignees.map(function(as) {
        return as.username;
    });

    List.addComboBox("assignee", "Assignee", inspection.assignee, "onChangeAssignee({id}, this.value)", options.join("|"));

    var cb = "viewInspection({id})";
    List.addButton("Save", "History.back()");
    List.show();
}

function onChangeAssignee (id, value) {

    var inspection = Query.selectId("inspections", id);

    var owner = inspection.owner;
    owner = MultiValue.add(owner, value);

    List.setValue("assignee", value);
    Query.updateId("inspections", id, "assignee", value);
    Query.updateId("inspections", id, "owner", owner);

    History.remove(1);
    History.redirect("editInspection({id})");
}

function deleteInspection (id) {
    var inspection = Query.selectId("inspections", id);
    Query.deleteId("inspections", id);
    History.remove(2);
    History.redirect("viewInspections({inspection.typeid})");
}

function newInspectionType () {
    var id = Query.insert("inspectiontypes", {});
    History.redirect("editInspectionType({id})");
}

function editInspectionType (id) {
    List.addItemTitle("Edit Inspection Type");

    var inspectiontype = Query.selectId("inspectiontypes", id);
    var onchange = "Query.updateId('inspectiontypes',{id}, this.id, this.value);History.reload()";

    List.addTextBox("name", "Name", inspectiontype.name, onchange);
    List.addTextBox("description", "Description", inspectiontype.description, onchange);

    var templates = Query.select("Forms.templates");
    var options = templates.map(function(template) {
        return template.id + ":" + template.name;
    });
    options.push(":None");
    List.addComboBox("templateid", "Template", inspectiontype.templateids, onchange, options.join("|"));

    List.addButton("Save", "History.back()");
    List.show();
}

function deleteAllInspections () {
    var inspections = Query.select("inspections");
    inspections.forEach(function (inspection) {
        var files = Query.select("System.files", "*", "linkedtable='inspections' linkedrecid={inspection.id}");
        files.forEach(function(file) {
            Query.deleteId("System.files", file.id);
        });
        var comments = Query.select("comments", "*", "inspectionid={inspection.id}");
        comments.forEach(function(comment) {
            Query.deleteId("comments", comment.id);
        });

        Query.deleteId("inspections", inspection.id);
    });
}


// Custom Functions
function customRejectForm (id, reason) {
    var note = reason;
    var form = Query.selectId("Forms.forms", id);
    Query.updateId("Forms.forms", id, "status", Forms.REJECTED);
    Forms.addHistory(form, R.REJECTED, note, "");
    Forms.changeOwner(id, form.owner);
    Forms.evalReject(form);
}

function customDuplicateInternal (form, linkedid, counterid) {
        var id = form.id;
        var photoFields = [];
        var form2 = {};
        form2.templateid = form.templateid;
        form2.status = Forms.DRAFT;
        form2.name = Forms.getNewName(form.templateid, counterid);
        form2.owner = User.getName();
        form2.date = Date.now();

        if (form.planid) {
            form2.planid = form.planid;
            form2.geo = form.geo;
        } else {
            form2.geo = Settings.getLocation();
            form2.address = Settings.getAddress(form.geo);
        }
        form2.linkedtable = form.linkedtable;
        form2.linkedid = linkedid;
        if (form.projectid)
            form2.projectid = form.projectid;
        if (counterid)
            form2.counterid = counterid;
        form2.hidden = form.hidden;
        var values2 = (form.value) ? JSON.parse(form.value) : {};
        var fields = Query.select("Forms.fields", "name;type", "formid=" + esc(form.templateid) + "", "rank");
        for (var i = 0; i < fields.length; i++) {
            var field = fields[i];
            if (field.type == "photo") {
                photoFields.push(field.name);
            }
        }
        form2.value = JSON.stringify(values2);
        form2.owner = form.owner;
        var newFormId = Query.insert("Forms.forms", form2);

        var files = Query.select("System.files", "id;name", "linkedtable='Forms.forms' AND linkedrecid=" + esc(id) + "");
        files.forEach(function (file) {
            duplicatePhoto(file.id, file.name, newFormId);
        });

        photoFields.forEach(function (photoField) {
            var linkedrecid = id + ":" + photoField;
            files = Query.select("System.files", "id;name", "linkedtable='Forms.forms' AND linkedrecid=" + esc(linkedrecid) + "");
            files.forEach(function (file) {
                duplicatePhoto(file.id, file.name, newFormId, photoField)
            });
        });
        return newFormId;
    }



function duplicateFilesForInspection (id, newid) {
    var inspection = Query.selectId("inspection", id);
    var duplicatedFileIds = "";

    var files = Query.select("System.files", "*", "linkedtable='inspection' AND linkedrecid={id}");
    var newFileIds = [];
    files.forEach(function(file) {
        var newFileId = App.duplicatePicture(file.id, file.name);
        newFileIds.push(newFileId);
    });


    newFileIds.forEach(function (newFileId) {
        Query.updateId("System.files", newFileId, "linkedrecid", newid);
    });
}

////////////////////////////////////////////////////////////////////
////////////////////////////MultiValue//////////////////////////////
////////////////////////////////////////////////////////////////////
function MultiValue() {}
MultiValue.contains = function(multivalue, value) {
    if (multivalue === null || multivalue === '')
        return false;
    multivalue = String(multivalue);
    var parts = multivalue.split('|');
    for (var i = 0; i < parts.length; i++) {
        if (parts[i] == value) {
            return true;
        }
    }
    return false;
}
MultiValue.add = function(multivalue, newvalue) {
    if (multivalue == null || multivalue == "")
        return newvalue;
    if (MultiValue.contains(multivalue, newvalue))
        return multivalue;
    return multivalue + "|" + newvalue;
}
MultiValue.remove = function(multivalue, removeValue) {
    if (multivalue == null || multivalue == "")
        return "";
    multivalue = String(multivalue);
    var parts = multivalue.split('|');
    for (var i = parts.length - 1; i >= 0; i--) {
        if (parts[i] == removeValue) {
            parts.splice(i, 1);
        }
    }
    return parts.join("|");
}
MultiValue.diff = function(multivalue1, multivalue2) {
    if (multivalue1 == "")
        return multivalue2;
    if (multivalue2 == "")
        return "";
    var map = new HashMap();
    var values1 = multivalue1.split("|");
    for (var i = 0; i < values1.length; i++)
        map.set(values1[i], 1);
    var values2 = multivalue2.split("|");
    var diff = [];
    for (var i = 0; i < values2.length; i++) {
        if (map.get(values2[i]) == null)
            diff.push(values2[i]);
    }
    return diff.join("|");
}
MultiValue.addMulti = function(multivalue1, multivalue2) {
    var diff = MultiValue.diff(multivalue1, multivalue2);
    if (diff == "")
        return multivalue1;
    else if (multivalue1 == "")
        return diff;
    else
        return multivalue1 + "|" + diff;
}


// FORM functions

function newFormInternal (templateid, linkedtable, linkedid, values, name, projectid, counterid) {
    var template = Query.selectId("Forms.templates", templateid);
    if (template == null)
        return null;
    var form = {};
    form.name = name;
    form.templateid = templateid;
    form.date = Date.now();
    form.owner = User.getName();
    form.geo = Settings.getLocation();
    form.address = Settings.getAddress(form.geo);
    if (linkedtable != null) {
        form.linkedtable = linkedtable;
        form.linkedid = linkedid;
    } else {
        form.linkedtable = template.linkedtable;
    }
    if (projectid)
        form.projectid = projectid;
    if (counterid)
        form.counterid = counterid;
    if (values == null)
        values = {};
    form.value = JSON.stringify(values);
    return Query.insert("Forms.forms", form);
}

function getFormValues (form) {
    if (form.value != null && form.value != "") {
        try {
            return JSON.parse(form.value);
        } catch (err) { }
    }
    return new Object();
}


function writeEditFields (form) {
    // form.value contains a json string of array values indexed by field names
    _valueObj = getFormValues(form);
    _formid = form.id;
    var onchange = "updateFieldValue({form.id},this.id,this.value)";

    var fields = getFields(form);
    for (var i = 0; i < fields.length; i++) {
        var field = fields[i];
        if (field.status == -1 || field.status == form.status) {
            if (field.onchange != "") _changeObj[field.id] = field.onchange;
            if (field.mandatory == 1) field.label += " (*)";

            if (field.type == "button") {
                if (field.value == "scan") {
                    var onscan = "Forms.onScan({form.id},{field.id},this.value)";
                    List.addButton(field.label, "App.scanCode({onscan})");
                } else if (form.linkedtable == "Forms.forms") {
                    // display button in edit mode only for subform
                    CustomFields.addButton(field.id, field.label, field.value, field.options, form.id);
                }
            } else {
                CustomFields.writeEditItem(field.id, field.type, field.label, field.value, onchange, field.options, form.id);
            }
        }
    }
};


function updateFieldValue (id, fieldid, fieldValue) {
    var form = Query.selectId("Forms.forms", id);
    var value = form.value? JSON.parse(form.value): {};

    value[fieldid] = fieldValue;
    value = JSON.stringify(value);

    Query.updateId("Forms.forms", id, "value", value);
    History.reload();
}
function Forms () {}

Forms._getValues = function (form) {
    if (form.value != null && form.value != "") {
        try {
            return JSON.parse(form.value);
        } catch (err) { }
    }
    return new Object();
}

Forms._getValue = function (valuesObj, field, form) {
    if (field.type == "header" || field.type == "label" || field.type == "button") {
        return field.value;
    } else if (field.type == "image") {
        var value = valuesObj[field.name];
        return value ? value : field.value;
    } else if (field.type == "photo") {
        return form.id + ":" + field.name;
    } else if (field.type == "formula") {
        return Forms._evalFormula(field.value, valuesObj, form, "FORMULA_" + field.name);
    } else {
        var value = valuesObj[field.name];
        if (value == null) value = "";
        return value;
    }
}

Forms._getFullValues = function (form, fields) {
    var values = Forms._getValues(form);
    for (var i = 0; i < fields.length; i++) {
        var field = fields[i];
        var value = values[field.name];
        if (field.type == 'date' || field.type == 'time' || field.type == 'datetime' || field.type == 'duration') {
            value = (value != null) ? parseInt(value) : 0;
        } else if (field.type == 'numeric') {
            value = (value != null && value != "") ? parseInt(value) : "";
        } else if (field.type == 'decimal') {
            value = (value != null && value != "") ? parseFloat(value) : "";
        } else if (value == null) {
            value = "";
        }
        values[field.name] = value;
    }
    return values;
}

Forms.writeViewFields = function (form) {
    // _valueObj = Forms._getValues(form); // we need this because Risk.view access it
    // _formid = form.id;
    var fields = getFields(form);
    for (var i = 0; i < fields.length; i++) {
        var field = fields[i];
        if (field.type == "button") {
            if (field.status == -1 || form.status == field.status) { // removed field,status == 0
                CustomFields.addButton(field.id, field.label, field.value, field.options, form.id);
            }
        } else if (form.status >= field.status || form.status == -1 || form.status == FORM_REVOKED) { // Allow to view when status is revoked
            CustomFields.addViewItem(field.id, field.type, field.label, field.value, field.options, form.id);
        }
    }
}

Forms.evalReject = function (form) {
    var template = Query.selectId("Forms.templates", form.templateid);
    if (template == null) return ;
    if (!template.onreject) return;
    var onreject = template.onreject.trim();
    if (onreject == "") return;

    var fields = Query.select("Forms.fields", "name;label;value;type;seloptions", "formid=" + esc(form.templateid), "rank");
    var formValues = Forms._getFullValues(form, fields);

    var js = "function f1() {\n" + onreject + "\n};f1();";
    var returnValue = Forms._evalFormula(js, formValues, form, "ONREJECT");
}

Forms.addHistory = function (form, name, note, signature) {
    var history = null;
    try {
        history = JSON.parse(form.history);
    } catch (e) {
    }
    if (history == null) history = [];

    history.push({ name: name, note: note, staff: User.getName(), date: Date.now(), signature: signature });
    Query.updateId("Forms.forms", form.id, "history", JSON.stringify(history));
}

Forms.changeOwner = function (id, owner) {
    var form = Query.selectId("Forms.forms", id);
    var files = Forms.selectFormPhotos(form);
    var subforms = Forms.selectSubForms(form);
    Query.updateId("Forms.forms", id, "owner", owner);
    // change the owner of the photos linked to the form too.
    for (var i = 0; i < files.length; i++) {
        Query.updateId("System.files", files[i].id, "owner", owner);
    }
    // same for subforms
    for (var i = 0; i < subforms.length; i++) {
        Query.updateId("Forms.forms", subforms[i].id, "owner", owner);
    }
}

function getFields (form, type) {
    var where = "formid={form.templateid}";
    if (type != null) where += " AND type={type}";
    var fields = Query.select("Forms.fields", "*", where, "rank");
    var formValues = Forms._getFullValues(form, fields);
    var lang = "en";
    if (Settings.getLanguage) lang = Settings.getLanguage();
    var hiddenFields = form.hidden ? JSON.parse(form.hidden) : [];

    var list = [];
    for (var i = 0; i < fields.length; i++) {
        var field = fields[i];
        var field2 = {};
        field2.id = field.name;
        field2.label = Forms.getFieldLabel(field, lang);
        field2.type = field.type;
        field2.status = field.status;
        field2.value = Forms._getValue(formValues, field, form);
        field2.options = Forms._eval(field.seloptions, form, "OPTIONS_" + field.name);
        field2.mandatory = field.mandatory;
        field2.onchange = field.onchange;

        if (field2.type == "risk") {
            var risk = Query.selectId("Qhse.risks", field.label);
            if (risk != null) {
                field2.label = risk.name;
                field2.options = risk.measures;
            }
        }
        // do not add the hidden fields
        if (hiddenFields.indexOf(field.name) == -1) {
            list.push(field2);
        }
    }
    return list;
}

Forms._eval = function (value, form, sourceURL) {
    if (value == null || value == "") {
        return "";
    } else if (value.indexOf("javascript:") == 0) {
        value = value.substr("javascript:".length);
    } else if (value.indexOf("=") == 0) {
        value = value.substr(1);
    } else {
        return value;
    }
    // value is javascript, eval
    return Forms._evalFormula(value, {}, form, sourceURL);
}

Forms._evalFormula = function (js, valuesObj, form, sourceURL) {
    js = js.trim();
    if (js.substring(0, 1) == "=") js = js.substring(1);
    else if (js.indexOf("javascript:") == 0) js = js.substr("javascript:".length);

    if (sourceURL) sourceURL = sourceURL.replace(/ /g, '_').toUpperCase();
    else sourceURL = "FORMULA";

    var buffer = [];
    for (var member in valuesObj) {
        buffer.push('var ' + member + '=' + esc(valuesObj[member]) + ";");
    }
    buffer.push(js);
    if (WEB()) buffer.push("//# sourceURL=http://FORM/" + sourceURL + ".js");
    buffer = buffer.join('\n');
    try {
        // link var is available in eval buffer, as well as form object
        var link = Forms._getLink(form);
        var result = eval(buffer);
        return result;
    } catch (e) {
        if (WEB()) {
            var msg = "%cForm Eval Formula Error:\n" + e.message + "\nForm: " + form.name + "\nSource: " + sourceURL;
            if (console != null) console.log(msg, "color:red");
        } else {
            App.confirm("Error: " + e.message + "\n" + buffer);
        }
        return "Error: " + e.message;
    }
}

Forms.duplicateInternal = function (form, linkedid, counterid) {
    var form2 = {};
    form2.templateid = form.templateid;
    form2.status = Forms.DRAFT;
    form2.name = Forms.getNewName(form.templateid, counterid);
    form2.owner = User.getName();
    form2.date = Date.now();
    if (form.planid) {
        form2.planid = form.planid;
        form2.geo = form.geo;
    } else {
        form2.geo = Settings.getLocation();
        form2.address = Settings.getAddress(form.geo);
    }
    form2.linkedtable = form.linkedtable;
    form2.linkedid = linkedid;
    if (form.projectid) form2.projectid = form.projectid;
    if (counterid) form2.counterid = counterid;
    form2.hidden = form.hidden;

    var values2 = (form.value)? JSON.parse(form.value): {};
    var fields = Query.select("Forms.fields", "name;type", "formid={form.templateid}", "rank");
    for (var i = 0; i < fields.length; i++) {
        var field = fields[i];
        if (field.type == "photo" || field.type == "signature") {
            values2[field.name] = "";
        }
    }
    form2.value = JSON.stringify(values2);
    return Query.insert("Forms.forms", form2);
};

Forms.getNewName = function (templateid, counterid) {
    var template = Query.selectId("Forms.templates", templateid);
    var counter;
    if (counterid) counter = "[NEW]";
    else {
        counter = 1 + template.counter;
        Query.updateId("Forms.templates", templateid, "counter", counter);
    }

    if (AccountSettings.get("forms.initials") == "1") {
        counter = User.getInitials() + "-" + counter;
    }
    return template.prefix + (template.prefix != "" ? "-" : "") + counter;
}

////////////////////////////////

Forms.selectFormPhotos = function (form) {
    var files = [];
    var fields = Query.select("Forms.fields", "name", "type='photo' AND formid={form.templateid}");
    for (var i = 0; i < fields.length; i++) {
        var field = fields[i];
        var value = form.id + ":" + field.name; // hack for photos.....
        var list = Query.select("System.files", "*", "linkedtable='Forms.forms' AND linkedrecid={value}", "date");
        files = files.concat(list);
    }
    // Novade code
    var list = Query.select("System.files", "*", "linkedtable='Forms.forms' AND linkedrecid={form.id}", "date");
    files = files.concat(list);
    // End of Novade code
    return files;
};

Forms.selectSubForms = function (form, columns, onlyEditableAllDraft) {
    var result = [];

    if (!form) return result;

    if (!columns) columns = "*";
    else if (columns != '*' && columns.indexOf("linkedid") == -1) columns += ";linkedid";

    var whereForms = "linkedtable='Forms.forms'";
    if (form.projectid) whereForms += " AND projectid={form.projectid}";
    var subforms = Query.select("Forms.forms", columns, whereForms, "date");
    var map = new HashMap(); // <fieldID, forms[]>
    subforms.forEach(function(subform) {
        var array = subform.linkedid.split(":");
        if (array[0] == form.id) {
            var fieldID = array[1] || 'all';
            var list = map.get(fieldID);
            if (!list) map.set(fieldID, [subform]);
            else list.push(subform);
        }
    });

    if (onlyEditableAllDraft) {
        // We need to filter out subforms which were not created when the main form was in Draft
        var where = "formid={form.templateid} AND type='button' AND status<1";
        var fields = Query.select("Forms.fields", "name;value", where, "rank");
        var subformFields = fields.filter(function(field) {
            return field.value == "code" || field.value == "newsubform";
        });
        if (map.get('all')) subformFields.push({name: 'all'}); // Push fake field 'all' in order to include the forms which were created via a script

        var history = Forms.getHistory(form);
        if (history.length > 0) {
            subformFields.forEach(function(field) {
                var fieldSubforms = map.get(field.name) || [];
                fieldSubforms = fieldSubforms.filter(function(subform) { return subform.date <= history[0].date; });
                map.set(field.name, fieldSubforms);
            });
        }
        subformFields.forEach(function(field) {
            result = result.concat(map.get(field.name) || []);
        });
    } else {
        map.keys.forEach(function(fieldID) {
            result = result.concat(map.get(fieldID) || []);
        });
    }

    return result;
};

Forms.getFieldLabel = function (field, lang) {
    lang = lang.toUpperCase();
    if (lang == "DE" && field.labelDE) return field.labelDE;
    else if (lang == "FR" && field.labelFR) return field.labelFR;
    else if (lang == "ES" && field.labelES) return field.labelES;
    else if (lang == "ZH" && field.labelZH) return field.labelZH;
    else if (lang == "ZHT" && field.labelZH) return field.labelZH;
    else return field.label;
}


function CustomFields () {}
CustomFields.addButton = function (id, label, value, options, formid) {
    // if (label.startsWith("__")) return; Sep 2017 we replace startsWith because of Javascript errors on Android 4 devices
    if (label.indexOf("__") == 0) return;
    var form = formid ? Query.selectId("Forms.forms", formid) : null;
    var onclick = null;
    if (value == "newtask") onclick = WEB() ? "TaskUtils.newTask()" : "Tasks.newTask()";
    else if (value == "newnote") onclick = "Notes.newNote()";
    else if (value == "newevent") onclick = "Calendar.newEvent()";
    else if (value == "newform") {
        var templateid = options;
        var linkedtable = form ? form.linkedtable : "";
        var linkedid = form ? form.linkedid : "";
        var projectid = form ? form.projectid : ""; // NOVADE CODE
        onclick = "Forms.newForm({templateid},{linkedtable},{linkedid},null,null,{projectid})";
    } else if (value == "newsubform") {
        var templateid = options;
        var linkedid = formid + ":" + id;
        List.addButton(label, "Forms.newForm({templateid},'Forms.forms',{linkedid},null,null,{form.projectid})", "color:gray"); // NOVADE CODE
        return;
    }
    else if (value == "code") {
        if (CustomFields.buttons == null) CustomFields.buttons = {};
        CustomFields.buttons[id] = options; // this contains the onclick for button
        onclick = "CustomFields.onButton({formid},{id})";
    } else return;
    List.addButton(label, onclick, "color:gray");
}


CustomFields.writeEditItem = function (id, type, label, value, onchange, options, formid) {
    if (type == 'header') {
        List.addHeader(label);
    } else if (type == 'select') {
        List.addComboBox(id, label, value, onchange, options);
    } else if (type == 'selectmulti') {
        List.addComboBoxMulti(id, label, value, onchange, options);
    } else if (type == 'toggle') {
        //label = Utils.xmlEncode(label);
        onchange += ";CustomFields.onPunch({formid},{label},this.value,{id})";
        List.addToggleBox(id, label, value, onchange, options);
    } else if (type == 'checkbox') {
        List.addCheckBox(id, label, parseInt(value), onchange);
    } else if (type == 'contact') {
        if (CustomFields.contactOptions == null) CustomFields.contactOptions = Query.options("Contacts.contacts");
        List.addComboBoxMulti(id, label, value, onchange, CustomFields.contactOptions, "CustomFields.onNewContact({formid},{id},this.value)");
    } else if (type == 'people') {
        if (CustomFields.peopleOptions == null) CustomFields.peopleOptions = Query.options("novaderesources.people");
        List.addComboBoxMulti(id, label, value, onchange, CustomFields.peopleOptions);
    } else if (type == 'company') {
        if (CustomFields.companyOptions == null) CustomFields.companyOptions = Query.options("Contacts.companies");
        List.addComboBoxMulti(id, label, value, onchange, CustomFields.companyOptions, "CustomFields.onNewCompany({formid},{id},this.value)");
    } else if (type == 'peoplecompany') {
        if (CustomFields.peoplecompanyOptions == null) CustomFields.peoplecompanyOptions = Query.options("novaderesources.companies");
        List.addComboBoxMulti(id, label, value, onchange, CustomFields.peoplecompanyOptions);
    } else if (type == 'project') {
        List.addComboBoxMulti(id, label, value, onchange, Query.options("Projects.projects", "status=0"));
    } else if (type == 'opp') {
        List.addComboBoxMulti(id, label, value, onchange, Query.options("Sales.opportunities", "status!=2")); // 2 : lost
    } else if (type == 'product') {
        List.addComboBoxMulti(id, label, value, onchange, Query.options("Sales.products", "status=0"));
    } else if (type == 'asset') {
        List.addComboBoxMulti(id, label, value, onchange, Query.options("Assets.assets"));
    } else if (type == 'tool') {
        List.addComboBoxMulti(id, label, value, onchange, CustomFields.getToolOptions(formid));
    } else if (type == 'form') {
        List.addComboBox(id, label, value, onchange, Query.options("Forms.forms", "templateid!=''"));
    } else if (type == 'user') {
        List.addComboBoxMulti(id, label, value, onchange, User.getOptions());
    } else if (type == "photo") {
        CustomFields.addFileBox(label, "Forms.forms", value, options); // options is for add new
    } else if (type == "drawing") {
        List.addHeader(label);
        if (value != "") List.addImage(Settings.getFileUrl(value), "App.editPicture({value})");
    } else if (type == "image") {
        List.addHeader(label);
        List.addImage(Settings.getFileUrl(value));
    } else if (type == 'signature') {
        List.addSignatureBox(id, label, value, onchange);
    } else if (type == 'barcode') {
        List.addBarcodeBox(id, label, value, onchange, options); // options if for custom action
    } else if (type == 'button') {
        // do not display button in edit mode
    } else if (type == 'label') {
        List.addItemLabel(label, " ", null, "color:gray");
    } else if (type == 'formula') {
        // do not display formula in edit mode
    } else if (type == 'textarea') {
        if (Settings.getPlatform() == "web") type = "textarea2";
        List.addTextBox(id, label, value, onchange, type);
    } else if (type == 'risk') {
        Risk.edit(id, label, value, options, formid);
    } else if (type == 'file') {
        List.addComboBox(id, label, value, onchange, Query.options("System.files", "folderid={options}"));
    } else if (type == 'novadeform') {
        var linkedForm = Query.selectId("Forms.forms", value);
        if (linkedForm && linkedForm.templateid == options) List.addComboBox(id, label, value, onchange, getNovadeFormOptions(options, value, formid));
        else List.addComboBox(id, label, "", onchange, getNovadeFormOptions(options, value, formid));
    } else if (type == "button") {
        // no button in edit mode
    } else if (type == 'score') {
        CustomFields.addScoreBox(label, value);
    } else {
        // works for text, phone, email, time, duration, currency
        List.addTextBox(id, label, value, onchange, type);
    }
}


CustomFields.onPunch = function (formid, label, value, id) {
    if (value == "P") {
        // Punch.newFormItem(formid, label);
    }
}


CustomFields.addViewItem = function (id, type, label, value, options, formid) {
    if (type == 'header') {
        List.addHeader(label);
        return;
    } else if (type == "button") {
        CustomFields.addButton(id, label, "code", options, formid);
        return;
    }
    if (value == null || value === "") return;


    var onclick = "";
    if (type == 'select' || type == 'selectmulti') {
        List.addItemLabel(label, (Format.options != null) ? Format.options(value, options) : value);
    } else if (type == 'toggle') {
        List.addToggleBox('', label, value, null, options);
    } else if (type == 'checkbox') {
        if (Settings.getPlatform() == "web") List.addItemLabel(label, (value == "1") ? R.YES : R.NO);
        else if (parseInt(value) == 1) List.addItem(label, '', 'icon:checked');
    } else if (type == 'contact') {
        CustomFields.writeMultivalueItem(label, value, "Contacts.contacts", "Contacts.viewContact", "contact");
    } else if (type == 'people') {
        if (User.hasApp("novaderesources")) onclick = "NovadeResources.viewPerson";
        CustomFields.writeMultivalueItem(label, value, "novaderesources.people", onclick, "contact");
    } else if (type == 'company') {
        CustomFields.writeMultivalueItem(label, value, "Contacts.companies", "Contacts.viewCompany", "company");
    } else if (type == 'peoplecompany') {
        // No NovadeResources.viewCompany yet so no onclick
        // if (User.hasApp("novaderesources")) onclick = "NovadeResources.viewCompany";
        CustomFields.writeMultivalueItem(label, value, "novaderesources.companies", onclick, "company");
    } else if (type == 'project') {
        CustomFields.writeMultivalueItem(label, value, "Projects.projects", "Projects.viewProject", "project");
    } else if (type == 'opp') {
        CustomFields.writeMultivalueItem(label, value, "Sales.opportunities", "Sales.viewOpp");
    } else if (type == 'product') {
        CustomFields.writeMultivalueItem(label, value, "Sales.products", "Sales.viewProduct");
    } else if (type == 'asset') {
        CustomFields.writeMultivalueItem(label, value, "Assets.assets", "Assets.viewAsset");
    } else if (type == 'tool') {
        CustomFields.writeMultivalueItem(label, value, "Tools.tools", "Tools.viewTool", "job");
    } else if (type == 'form') {
        CustomFields.writeMultivalueItem(label, value, "Forms.forms", Forms._VIEWFORM);
    } else if (type == 'user') {
        var owners = value.split("|");
        var contactids = [];
        for (var i = 0; i < owners.length; i++) {
            var contact = User.getContact(owners[i]);
            if (contact != null) contactids.push(contact.id);
        }
        CustomFields.writeMultivalueItem(label, contactids.join("|"), "Contacts.contacts", "Contacts.viewContact", "contact"); // no table="" id and value are the same
    } else if (type == "photo") {
        CustomFields.addFileBox(label, "Forms.forms", value);
    } else if (type == "drawing") {
        List.addHeader(label);
        List.addImage(Settings.getFileUrl(value));
    } else if (type == "image") {
        List.addHeader(label);
        List.addImage(Settings.getFileUrl(value));
    } else if (type == 'signature') {
        if (User.isAdmin()) onclick = "Forms.popupResetSignature({formid},{id})";
        if (WEB()) List.addItemLabel(label, Format.image64(value), onclick);
        else List.addSignatureBox('', label, value, '');
    } else if (type == 'barcode') {
        List.addItemLabel(label, value);
    } else if (type == 'label') {
        List.addItemLabel(label, " ", null, "color:gray");
    } else if (type == 'phonenumber' || type == 'phone') {
        List.addItemLabel(label, Format.phone(value), "App.call({value})");
    } else if (type == 'email') {
        List.addItemLabel(label, value, "App.mailto({value})");
    } else if (type == 'link') {
        if (WEB()) List.addItemLabel("", label, "App.web({value})");
        else List.addItemLabel(label, value, "App.web({value})");
    } else if (type == 'date') {
        // do not display Someday date for forms
        if (value != 0) List.addItemLabel(label, Format.date(parseFloat(value)));
    } else if (type == 'time') {
        if (value == 0) return; // Otherwise on Android value = 0 is displayed as a default time, i.e 7:30
        List.addItemLabel(label, Format.time(parseFloat(value)));
    } else if (type == 'datetime') {
        if (value == 0) return;  // do not display One day...
        List.addItemLabel(label, Format.datetime(parseFloat(value)));
    } else if (type == 'duration') {
        List.addItemLabel(label, Format.duration(parseInt(value)));
    } else if (type == 'textarea') {
        if (Settings.getPlatform() != "web") value = Format.text(value);
        List.addItemLabel(label, value);
    } else if (type == 'numeric' || type == 'decimal') {
        //List.addItemLabel(label, Number(value).toLocaleString());
        List.addItemLabel(label, CustomFields.toLocaleString(value)); // we do this : because toLocaleString() rounds to 3 decimals only.....
    } else if (type == 'formula') {
        List.addItemLabel(label, value);
    } else if (type == 'risk') {
        Risk.view(id, label, value);
    } else if (type == 'location') {
        List.addItemLabel(label, value, "App.map({value})");
    } else if (type == "file") {
        List.addItemLabel(label, Query.names("System.files", value), CustomFields._VIEWFILE + "({value})");
    } else if (type == 'novadeform') {
        CustomFields.writeMultivalueItem(label, value, "Forms.forms", Forms._VIEWFORM);
    } else if (type == 'score') {
        CustomFields.addScoreBox(label, value);
    } else {
        List.addItemLabel(label, value);
    }
}


CustomFields.addFileBox = function (label, table, id, action) {
    var files = [];
    if (table && id) files = Query.select("System.files", "id;name;mime;externalurl", "linkedtable={table} AND linkedrecid={id}", "date");
    if (action == null && files.length == 0) return;

    if (label != null) List.addHeader(label);

    if (WEB()) {
        _html.push('<div style="margin-left:60px;">');
        NextPrevious.addSection();
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            var fileid = (file.mime.indexOf("image/") != -1 && file.externalurl == "") ? file.id : null;
            List.addThumbnail(file.name, fileid, CustomFields._VIEWFILE + "({file.id})");
        }
        if (action != null) FileBox.writeButton("", R.SELECTFILE, "FilePicker.pick({table},{id})", "");
        _html.push('</div>');
    } else {
        if (action != null) {
            var label = (action == "scan") ? R.SCANDOCUMENT : R.ADDPHOTO;
            List.addItem(label, "App.takePicture({table},{id},{action})", "img:camera;icon:new");
        }

        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            var style = null;
            if (file.mime == 'image/jpeg' || file.mime == 'image/png' || file.mime == 'image/gif') style = "scale:crop;img:" + Settings.getFileUrl(file.id);
            List.addItem(file.name, CustomFields._VIEWFILE + "({file.id})", style);
        }
    }
}

CustomFields.addScoreBox = function (label, value) {
    var onchange = "";
    var options = "";
    List.addToggleBox('', label, value, onchange, options);
}
