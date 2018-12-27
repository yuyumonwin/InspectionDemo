Config.appid = "mockup_inspection";
Config.version = "91";
Config.title = "Inspection Demo";
Config.uses = "NovadeTrack;";
Config.beta = "1";

Config.include = [
    "../Library/systemtables.js", "../Library/resources.js"
];

Config.tables["comments"] = "id;owner;projectid;defectid;caseid;inspectionid;comment;date DATE;type INTEGER;deletedby";
Config.tables["inspectiontype"] = "id;name;description;templateid";
Config.tables["inspection"] = "id;name;unitids;typeid;description;owner;lodgedby;assignee;inspectionstatus INTEGER;status INTEGER;parentid;startdate DATE;scheduledate DATE;date DATE;confirmationdate DATE;approvaldate DATE;rejecteddate DATE;fileids;formid;commentids";

var NEW = 1;
var WIP = 2;
var APPROVED = 3;
var REJECTED = -1;

var CHK_DESCIPTION = "chk_description";
var CHK_ASSIGNEE = "chk_assignee";
var CHK_SCHDULEDATE = "chk_schduledate";
var CHK_FILEIDS = "chk_fileids";
var CHK_FORMID = "chk_formid";

function main() {

    List.addItem("Inspection Types", "viewInspectionTypes()", "img:activities;icon:arrow");
    var data = getInspectionData();

    if (WEB()) {
        List.addItem("Inspections", "viewInspectionGroups()", "img:inspection;icon:arrow");
    } else {

        Toolbar.addButton("Add New Inspection", "selectUnit('32', '', '')", "new");

        var userName = User.getName();
        var inspections = Query.select("inspection", "*", "owner CONTAINS {userName}");

        if (userName == "yuyumonwin") { // This is Admin. Should be Maincon/subcon account to test

            var insp = Query.select("inspection", "*", "owner CONTAINS {User.getName()}", "date");
            List.addItem("All", "viewMobileInspections('all')", "img:job;count:" + data.all);
            List.addItem("Draft", "viewMobileInspections('new')", "img:edit;count:" + data.new);
            List.addItem("Work In Progress", "viewMobileInspections('wip')", "img:job;count:" + data.wip);
            List.addItem("Rejected", "viewMobileInspections('rejected')", "img:pause;count:" + data.rejected)

            List.addHeader("");
            List.addItem("Done", "viewMobileInspections('done')", "img:inspection;count:" + data.done);


        } else { // this should be consultant account

            inspections = inspections.filter(function(inspection) { return inspection.assignee == userName; });

            List.addItem("All", "viewMobileInspections('all')", "img:job;count:" + data.all);
            List.addItem("Overdue", "viewMobileInspections('overdue')", "img:clock;count:" + data.overdue);
            List.addItem("Today", "viewMobileInspections('today')", "img:edit;count:" + data.today);
            List.addItem("Tomorrow", "viewMobileInspections('tomorrow')", "img:extendtime;count:" + data.tomorrow);

            List.addHeader("");
            List.addItem("Scheduled", "viewMobileInspections('schedule')", "img:calendar;count:" + data.schedule);
            List.addItem("Done", "viewMobileInspections('done')", "img:inspection;count:" + data.done);
        }
    }
    List.show();
}

function getInspectionData () {
    var userName = User.getName();
    var inspections = Query.select("inspection", "*", "owner CONTAINS {userName}", "date");

    // App.alert("Come here 2 : " + inspections.length);

    // var filteredInspections = [];
    // var inspectionMap = new HashMap();

    // filteredInspections = inspections;

    // inspections.forEach(function(inspection) {
    //     if (inspection.parentid) inspectionMap.set(inspection.parentid, inspection);
    //     else inspectionMap.set(inspection.id, inspection);
    // });


    // inspectionMap.keys.forEach(function(key) {
    //     filteredInspections.push(inspectionMap.get(key));
    // });

    if (userName == "yuyumonwin") {}
    else {
        // inspections = inspections.filter(function(inspection) {
        //     return inspection.assignee == userName;
        // });
    }

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


    var today = Date.today();
    var tomorrow = Date.addDays(today, 1);
    var nextDay = Date.addDays(tomorrow, 1);
    inspections.forEach(function (inspection) {
        if (inspection.status == WIP) {
            if (inspection.inspectionstatus) {
                data.wip++;
                data.wipData.push(inspection);
            }
            var scheduledate = inspection.scheduledate;
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
        } else {
            if (inspection.status == NEW) {
                data.new++;
                data.newData.push(inspection);
            } else if (inspection.status == APPROVED) {
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
    }

   inspections.forEach(function (inspection) {
        List.addItem(inspection.name, "viewInspection({inspection.id})", "img:inspection");
    });
    List.show();

}

function viewInspectionTypes () {
    Toolbar.addButton("Add New Inspection Type", "newInspectionType()", "new");
    List.addItemTitle("Inspection Types");
    var types = Query.select("inspectiontype");
    types.forEach(function(type) {
        List.addItem(type.name, "editInspectionType({type.id})", "img:activities");
    });
    List.show();
}

function viewInspectionGroups () {
    Toolbar.addButton("Add New Inspection", "selectUnit('32', '', '')", "new");
    List.addItemTitle("Inspections By Types")

    var inspections = Query.selectDistinct("inspection", "typeid");
    inspections.forEach(function (inspection) {
        var type = Query.selectId("inspectiontype", inspection.typeid);
        var count = Query.count("inspection", "typeid={inspection.typeid}");
        List.addItemSubtitle(type.name, "Total Inspections - " + count, "viewInspections({type.id})", "img:activities");
    });
    List.show();
}

function viewInspections (typeid) {
    if (typeid) {

        var type = Query.selectId("inspectiontype", typeid);
        List.addItemTitle("Inspections", "Type - " + type.name);

        var inspections = Query.select("inspection", "*", "typeid={typeid}");
        inspections.forEach(function (inspection) {
            List.addItem(inspection.name, "viewInspection({inspection.id})", "img:inspection");
        });
    } else {
        var inspections = Query.select("inspection", "*", "owner CONTAINS {User.getName()}", "date");
        inspections.forEach(function (inspection) {
            List.addItem(inspection.name, "viewInspection({inspection.id})", "img:inspection");
        });
    }
    List.show();
}

// function selectBlock (projectid) {
//     var units = Query.selectDistinct("novadetrack.units", "block", "projectid={projectid}");

//     if (units.length == 1) {
//         History.redirect("selectLevel({projectid})");
//     } else {
//         for (i = 0; i < units.length; i++) {
//             var unit = units[i];
//             var label = unit.block? "Block" + " " + unit.block : "Block" + " -";
//             List.addItem(label, "selectLevel({projectid}, {unit.block})");
//         }
//         List.show();
//     }
// }

// function selectLevel (projectid, block) {
//     var histToRemove = 1;
//     histToRemove = histToRemove + 1;
//     var level, units = Query.selectDistinct("novadetrack.units", "level", "projectid={projectid} AND block={block}");
//     if (units.length == 1) {
//         level = units[0].level;
//         History.redirect("selectUnit({projectid})");
//     } else {
//         List.addItemTitle("Select Level");
//         for (var i = 0; i < units.length; i++) {
//             var unit = units[i];
//             level = unit.level? "Level" + " " + unit.level : "Level" + " -";
//             List.addItem(level, "selectUnit({projectid}, {block}, {unit.level}, {histToRemove})");
//         }
//         List.show();
//     }
// }

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
    var types = Query.select("inspectiontype");
    types.forEach(function (type) {
        List.addItem(type.name, "newInspection({type.id}, {unitid}, {histToRemove})");
    });
    List.show();
}

function viewInspection (id, tab) {

    var userName = User.getName();

    LocalSettings.set(CHK_FILEIDS, 0);
    LocalSettings.set(CHK_FORMID, 0);

    Toolbar.addTab("Info", "viewInspection({id})");
    Toolbar.addTab("History", "viewInspection({id}, 'history')");

    var inspection = Query.selectId("inspection", id);
    var inspectionstatus = inspection.inspectionstatus;
    if (!tab) {
        Toolbar.addButton("Edit", "editInspection({id})", "edit");

        var displayStatus = "TO DO";
        var status = inspection.status;
        if (status == NEW) displayStatus = "TO DO";
        else if (status == WIP) displayStatus = "Inspection In Progress";
        else if (status == APPROVED) displayStatus = "Inspection Approved";
        else if (status == REJECTED) displayStatus = "Rejected";

        List.addItemTitle(inspection.name, displayStatus);

        if (userName != "yuyumonwin" && !inspectionstatus) {
            List.addButton("Start", "Query.updateId('inspection', {id}, 'inspectionstatus', 1); History.reload();");
        } else {
            if (status == NEW) List.addButton("Submit", "confirmInspection({id})");
            else if (status == WIP) {
                List.addButton("Approve", "approveInspection({id})");
                // List.addButton("Reject", "rejectInspection({id})", "color:#FF0000");
                List.addButton("Reject", "gotoCollectDataToDuplicateForReject({id})", "color:#F1524C");
            }
        }

        var type = Query.selectId("inspectiontype", inspection.typeid);
        List.addItemSubtitle("Type", type.name, "", "img:activities");
        List.addItemSubtitle("Description", inspection.description, "", "img:note");
        var unit = Query.selectId("novadetrack.units", inspection.unitids);
        var completeLocation = [];
        if (unit) {
            if (unit.block) completeLocation.push(unit.block);
            if (unit.level) completeLocation.push(unit.level);
            completeLocation.push(unit.name);
        }
        List.addItemSubtitle("Unit", completeLocation.join(", "), "", "img:company")
        List.addItemSubtitle("Scheduled Date", Format.date(inspection.scheduledate), "", "img:calendar");
        List.addItemSubtitle("Assign To", inspection.assignee, "", "img:group");

        if (inspection.formid) {
            List.addHeader("");
            var form = Query.selectId("Forms.forms", inspection.formid);
            Forms.writeViewFields(form);
        }

        writeInspectionPhotos(id);
        if (inspection.status != -1) List.addButton("Add Photo", "takePix({id})", "color:#8D8D8D");
        writeComments(id);
        if (inspection.status != -1) List.addButton("Add Comment", "addComment({id})", "color:#8D8D8D")

        // List.addButton(R.ADDCOMMENT, "newComment('nonconformities', {id})", "color:gray;");

    } else {
        if (inspection.parentid) {
            var parentInspection = Query.selectId("inspection", inspection.parentid);
            List.addItemSubtitle("Parent Inspection", parentInspection.name, "viewInspection({parentInspection.id})", "img:form;icon:arrow");
        }
        List.addHeader("");
        List.addItemLabel("Created Date", Format.datetime(inspection.date));
        if (inspection.confirmationdate) List.addItemLabel("Confirmed Date", Format.datetime(inspection.confirmationdate));
        if (inspection.approvaldate) List.addItemLabel("Approved Date", Format.datetime(inspection.approvaldate));
        else if (inspection.rejecteddate) List.addItemLabel("Rejected Date", Format.datetime(inspection.rejecteddate));
    }
    List.show();
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
    var inspection = Query.selectId("inspection", id);
    var photos = Query.select("System.files", "id", "linkedtable='inspection' AND linkedrecid={id}");
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
    App.takePicture('inspection', id, null, "");
}

function newInspection (typeid, unitid, histToRemove) {
    var type = Query.selectId("inspectiontype", typeid);

    var count = Query.count("inspection", "typeid={typeid}") + 1;
    var inspection = {
        name: type.name + " " + count,
        typeid: typeid,
        date: Date.now(),
        description: type.description,
        status: NEW,
        unitids: unitid,
        lodgedby: User.getName(),
        owner: User.getName()
    }
    var id = Query.insert("inspection", inspection);
    if (type.templateid) {
        var formid = newFormInternal(type.templateid, "inspection", inspection.id);
        Query.updateId("inspection", id, "formid", formid);
    }

    History.remove(parseInt(histToRemove));
    History.redirect("editInspection({id})");
}

function confirmInspection (id) {
    var inspection = Query.selectId("inspection", id);
    if (App.confirm("Are you sure you want to confirm this inspection?") === false) return false;

    Query.updateId("inspection", id, "status", WIP);
    Query.updateId("inspection", id, "confirmationdate", Date.now());
    History.remove();
    History.redirect("viewInspection({id})");
}

function approveInspection (id) {
    var inspection = Query.selectId("inspection", id);
    if (App.confirm("Are you sure you want to approve this inspection?") === false) return false;

    Query.updateId("inspection", id, "status", APPROVED);
    Query.updateId("inspection", id, "approvaldate", Date.now());
    History.remove();
    History.redirect("viewInspection({id})");
}

function gotoCollectDataToDuplicateForReject (id) {
    var inspection = Query.selectId("inspection", id);
    if (App.confirm("Are you sure you want to reject this inspection?") === false) return false;
    History.remove();
    History.redirect("selectDataToDuplicate({id})");
}


function selectDataToDuplicate (id) {
    var inspection = Query.selectId("inspection", id);
    var files = Query.select("System.files", "id", "linkedtable='inspection' AND linkedrecid={id}");

    if (!inspection.formid && !files.length)
        History.redirect("rejectInspection({id})");
    else {
         List.addItemTitle("Select data to duplicate");
        var fileids = LocalSettings.get(CHK_FILEIDS, 0);
        var formid = LocalSettings.get(CHK_FORMID, 0);

        fileids = parseInt(fileids);
        formid = parseInt(formid);

        var onchange = "LocalSettings.set(this.id, this.value);";
        if (files.length) List.addCheckBox("chk_fileids", "Files", fileids, onchange);
        if (inspection.formid) List.addCheckBox("chk_formid", "Attached Form", formid, onchange);

        List.addButton("Reject", "rejectInspection({id})");
        List.show();
    }
}

function rejectInspection (id) {
    var inspection = Query.selectId("inspection", id);
    var fileids = LocalSettings.get(CHK_FILEIDS, 0);
    var formid = LocalSettings.get(CHK_FORMID, 0);

    fileids = parseInt(fileids);
    formid = parseInt(formid);

    var commentid = Query.insert("comments", {
        date: Date.now(),
        comment: "rejected by RE/RTO",
        type: 1,
        inspectionid: id
    });

    var newInspection = {};
    newInspection.description = inspection.description;
    newInspection.assignee = inspection.assignee;
    newInspection.scheduledate = inspection.scheduledate;

    var type = Query.selectId("inspectiontype", inspection.typeid);
    var count = Query.count("inspection", "typeid={type.id}") + 1;
    var name = type.name + " " + count;

    newInspection.name = name;
    newInspection.date = Date.now();
    newInspection.typeid = inspection.typeid;
    newInspection.unitids = inspection.unitids;
    newInspection.status = NEW;

    var parentid = "";
    if (inspection.parentid) parentid = inspection.parentid;
    else parentid = inspection.id;
    newInspection.parentid = parentid;
    var newInspectionId = Query.insert("inspection", newInspection);
    // inspection.commentids = MultiValue.add(inspection.commentids, commentid);

    if (formid) {
        var form = Query.selectId("Forms.forms", inspection.formid);
        var newFormId = Forms.duplicateInternal(form, newInspectionId);
        Query.updateId("inspection", newInspectionId, "formid", newFormId);
    } else if (type.templateid) {
        var newEmptyFormId = newFormInternal(type.templateid, "inspection", newInspectionId);
        Query.updateId("inspection", newInspectionId, "formid", newEmptyFormId);
    }

    if (fileids) {
        var files = Query.select("System.files", "*", "linkedtable='inspection' AND linkedrecid={id}");
        var newFileIds = [];
        files.forEach(function(file) { newFileIds.push(App.duplicatePicture(file.id, file.name)); });
        newFileIds.forEach(function (newFileId) {
            Query.updateId("System.files", newFileId, "linkedrecid", newInspectionId);
            Query.updateId("System.files", newFileId, "linkedtable", "inspection");
        });
    }

    Query.updateId("inspection", id, "status", -1);
    Query.updateId("inspection", id, "rejecteddate", Date.now());
    Query.updateId("inspection", id, "commentids", inspection.commentids);

    History.remove();
    History.add("viewInspections({inspection.typeid})");
    History.redirect("viewInspection({newInspectionId})");
}

function editInspection (id) {
    Toolbar.addButton("DELETE", "deleteInspection({id})", "delete");
    List.addItemTitle("Edit Inspection");

    var inspection = Query.selectId("inspection", id);

    var onchange = "Query.updateId('inspection',{id}, this.id, this.value);History.reload()";

    List.addTextBox("name", "Name", inspection.name, onchange);
    List.addTextBox("description", "Description", inspection.description, onchange);
    List.addTextBox("scheduledate", "Schedule Date", inspection.scheduledate, onchange, "date")

    var allAssignees = Query.select("novaderesources.people");
    allAssignees = allAssignees.filter(function(as) { return MultiValue.contains(as.projectids, "32"); });

    var options = allAssignees.map(function(as) {
        return as.username;
    });

    List.addComboBox("assignee", "Assignee", inspection.assignee, "onChangeAssignee({id}, this.value)", options.join("|"));
    if (inspection.formid) {
        var form = Query.selectId("Forms.forms", inspection.formid);
        writeEditFields(form);
    }

    var cb = "viewInspection({id})";
    List.addButton("Save", "History.remove();History.redirect({cb})");
    List.show();
}

function onChangeAssignee (id, value) {

    var inspection = Query.selectId("inspection", id);

    var owner = inspection.owner;
    owner = MultiValue.add(owner, value);

    List.setValue("assignee", value);
    Query.updateId("inspection", id, "assignee", value);
    Query.updateId("inspection", id, "owner", owner);

    History.remove(1);
    History.redirect("editInspection({id})");
}

function deleteInspection (id) {
    var inspection = Query.selectId("inspection", id);
    Query.deleteId("inspection", id);
    History.remove(2);
    History.redirect("viewInspections({inspection.typeid})");
}

function newInspectionType () {
    var id = Query.insert("inspectiontype", {});
    History.redirect("editInspectionType({id})");
}

function editInspectionType (id) {
    List.addItemTitle("Edit Inspection Type");

    var inspectiontype = Query.selectId("inspectiontype", id);
    var onchange = "Query.updateId('inspectiontype',{id}, this.id, this.value);History.reload()";

    List.addTextBox("name", "Name", inspectiontype.name, onchange);
    List.addTextBox("description", "Description", inspectiontype.description, onchange);

    var templates = Query.select("Forms.templates");
    var options = templates.map(function(template) {
        return template.id + ":" + template.name;
    });
    options.push(":None");
    List.addComboBox("templateid", "Template", inspectiontype.templateid, onchange, options.join("|"));

    List.addButton("Save", "History.back()");
    List.show();
}

function deleteAllInspections () {
    var inspections = Query.select("inspection");
    inspections.forEach(function (inspection) {
        var files = Query.select("System.files", "*", "linkedtable='inspection' linkedrecid={inspection.id}");
        files.forEach(function(file) {
            Query.deleteId("System.files", file.id);
        });
        var comments = Query.select("comments", "*", "inspectionid={inspection.id}");
        comments.forEach(function(comment) {
            Query.deleteId("comments", comment.id);
        });

        Query.deleteId("inspection", inspection.id);
    });
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

//////////////////////////////////

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
