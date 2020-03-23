let mailListClickbtns = [];
let mailListMarkCount = 0;
let currentDomainId = 0;
$(document).ready(function () {
    showLoadingTemplate();
    var doOnce = true;
    var doOncePage = true;

    let authToken = localStorage.getItem("authtoken");
    let currentUser = parseJwt(authToken).scope[0].authority;
    let currentUserName = parseJwt(authToken).name;
    // console.log('------------------------------')
    // console.log(`user type = ${currentUser}`)
    // console.log(`user name = ${currentUserName}`)
    // console.log('------------------------------')
    displayUsername(currentUserName)


    $.ajaxSetup({
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem("authtoken")
        }
    });

    if (currentUser === "SUPER_ADMIN") {
        changeWebContentForSuperAdmin();

        $.get(authIP + "/loadAllUser", function (users) {
            localStorage.setItem("userListAsHtml", JSON.stringify(users));
            getAllUnassignedDomains(1);
        });
        $('#pagination-here').on("page", function (event, num) {
            if (!doOncePage)
                getAllUnassignedDomains(num);

            doOncePage = false;
        });

        $('#pagination-pending-list').on("page", function (event, num) {
            if (!doOncePage)
                getAllPendingDomains(num);

            doOncePage = false;
        });

        $('#pagination-done-list').on("page", function (event, num) {
            if (!doOncePage)
                // getAllCompletedDomain(num);

                doOncePage = false;
        });

        $('#pagination-inprogress-list').on("page", function (event, num) {
            if (!doOncePage)
                // getAllInProgressDomain(num);

                doOncePage = false;
        });



        // processing pending list
        $("#pending-tab").click(function () {
            doOncePage = true;
            $("#myTab>li>a").removeClass("disabled");
            $(this).addClass("disabled");
            showLoadingTemplate();
            getAllPendingDomains(1)
        });

        $("#inprogress-tab").click(function () {
            doOncePage = true;
            $("#myTab>li>a").removeClass("disabled");
            $(this).addClass("disabled");
            showLoadingTemplate();
            getAllInProgressDomainAndUrlForSuperAdmin();
            // getAllInProgressDomain(1);
        });

        $("#todo-tab").click(function () {
            $("#myTab>li>a").removeClass("disabled");
            $(this).addClass("disabled");
        });

        $("#done-tab2").click(function () {
            doOncePage = true;
            $("#myTab>li>a").removeClass("disabled");
            $(this).addClass("disabled");
            showLoadingTemplate();
            getAllCompletedDomainAndUrlsForSuperAdmin();
            // getAllCompletedDomain(1);
        });


    } else if (currentUser === "USER") {




        removeUnwantedElementsForUser();
        changeWebContentForUsers();
        getAllAssignedDomainsForUser(1);

        // processing pending list
        $("#pending-tab").click(function () {
            doOncePage = true;
            $("#myTab>li>a").removeClass("disabled");
            $(this).addClass("disabled");
            showLoadingTemplate();
            // getAllPendingDomains(1)
        });

        $("#inprogress-tab").click(function () {

            // console.log("clickd on inprogresss")
            doOncePage = true;
            $("#myTab>li>a").removeClass("disabled");
            $(this).addClass("disabled");
            showLoadingTemplate();
            // getAllInProgressDomain(1);
            getAllAssingedInprogressUrlsForUser();

        });

        $("#todo-tab").click(function () {
            $("#myTab>li>a").removeClass("disabled");
            $(this).addClass("disabled");
        });

        $("#done-tab2").click(function () {
            doOncePage = true;
            $("#myTab>li>a").removeClass("disabled");
            $(this).addClass("disabled");
            showLoadingTemplate();
            // getAllCompletedDomain(1);
            getAllAssignedCompletedUrlsForUser();
        });


    }
    // list all unassigned domains

    function getAllUnassignedDomains(pageNumber) {
        $.get(authIP + "/listAllDomainsForSuperAdmin", function (response) {
            hideLoadingTemplate();
            $("#tab_content1 tbody").empty();
            // console.log(response)
            for (let x of response) {

                let assignedUsername = (!(x.assignedUserId)) ? "Not Assigned" : x.assignedUserId.name;
                let urlList = "";
                for (let url of x.domainUrlList) {
                    if (url.inProgress === false) {
                        urlList += `<li>
                        <div class="row">
                            <div class="col-md-1">
                            <span>${url.id}</span>
                            </div>
                            <div class="col-md-8">
                            <p>${url.url}</p>    
                            </div>
                            <div class="col-md-3">
                          
                            </div>
                        </div>
                        </li>`;
                    }

                }
                // $("#assigned-domain-for-user-accordion").append(`
                $("#tab_content1 tbody").append(`<tr><td>${x.id}</td><td>
                <div class="panel">
                <a class="panel-heading collapsed" role="tab" id="headingOne" data-toggle="collapse" data-parent="#accordion" href="#collapse${x.id}" aria-expanded="false" aria-controls="collapseOne">
                    <h4 class="panel-title">${x.domainName}</h4>
                </a>
                <div id="collapse${x.id}" class="panel-collapse collapse" role="tabpanel" aria-labelledby="headingOne" aria-expanded="true" style="height: 0px;">
                    <div class="panel-body">
                    <ul class="to_do">
                    ${urlList}
                    </div>
                </div>
            </div>
               </td>
                <td>${assignedUsername}</td>
                <td>${x.runStartDate}</td>
                ${(x.completed === true) ? "<td style='color:green'>Completed</td>" : "<td>Not Completed</td>"}
                </tr>`)
            }


            // $.each(response, function (key, domain) {
            //     $("#tab_content1 tbody").append(`<tr>
            //     <td>${domain.id}</td>
            //     <td>${domain.domainName}</td>
            //     <td></td>
            //     <td></td>
            //     </tr>`);
            // });

        });
    }


    // list all pending domain

    function getAllPendingDomains(pageNumber) {
        doOnce = true;
        $("#tab_content4 tbody").empty();
        $.get(authIP + "/listAllPendingDomains?page=" + pageNumber + "&size=10&sort=domainName", function (response) {
            hideLoadingTemplate();
            if (doOnce) {
                $('#pagination-pending-list').bootpag({
                    total: response.totalPages,
                    page: 1,
                    maxVisible: 5,
                    leaps: true
                });

                $("#pagination-pending-list ul").addClass("pagination");

                doOnce = false;
            }
            $.each(response.content, function (key, domain) {
                var assigneeList = "<ul>";

                $.each(domain.assignee, function (key, assignee) {
                    assigneeList += '<li class="list-style">' + assignee.name + '</li>'
                });

                assigneeList += "</ul>"

                $("#tab_content4 tbody").append('<tr> <td>' + (key + 1) + '</td><td>' + domain.domainName + '</td><td>' + assigneeList + '</td><td>' +
                    generateAssigneeList(domain.assignee, localStorage.getItem("userListAsHtml")) + '<div class="form-group"> <div class="col-md-9 col-sm-9 col-xs-12"> ' +
                    ' </div></div></td><td>' + domain.assigner.name + '</td>' +
                    '<td><button type="button" class="btn btn-success btn-xs">ReAssign</button></td></tr>');
            });
        });
    }

    // list all completed domains
    function getAllCompletedDomain(pageNumber) {
        doOnce = true;
        $("#tab_content3 tbody").empty();
        $.get(authIP + "/listAllCompletedDomains?page=" + pageNumber + "&size=10&sort=domainName", function (response) {
            hideLoadingTemplate();
            if (doOnce) {
                $('#pagination-done-list').bootpag({
                    total: response.totalPages,
                    page: 1,
                    maxVisible: 5,
                    leaps: true
                });

                $("#pagination-done-list ul").addClass("pagination");

                doOnce = false;
            }
            $.each(response.content, function (key, domain) {
                var assigneeList = "<ul>";

                $.each(domain.assignee, function (key, assignee) {
                    assigneeList += '<li class="list-style">' + assignee.name + '</li>'
                });

                assigneeList += "</ul>"

                $("#tab_content3 tbody").append('<tr> <td>' + (key + 1) + '</td><td>' + domain.domainName + '</td><td>' + assigneeList + '</td><td>' +
                    domain.assigner.name + '</td><td><button type="button" class="btn btn-success btn-xs">Get Report</button></td></tr>');
            });
        });
    }

    // list all in -progress domains
    function getAllInProgressDomain(pageNumber) {
        doOnce = true;
        $("#tab_content2 tbody").empty();
        $.get(authIP + "/listAllInProgressDomains?page=" + pageNumber + "&size=10&sort=domainName", function (response) {
            hideLoadingTemplate();
            if (doOnce) {
                $('#pagination-inprogress-list').bootpag({
                    total: response.totalPages,
                    page: 1,
                    maxVisible: 5,
                    leaps: true
                });

                $("#pagination-inprogress-list ul").addClass("pagination");

                doOnce = false;
            }
            $.each(response.content, function (key, domain) {
                var assigneeList = "<ul>";

                $.each(domain.assignee, function (key, assignee) {
                    assigneeList += '<li class="list-style">' + assignee.name + '</li>'
                });

                assigneeList += "</ul>"

                $("#tab_content2 tbody").append('<tr> <td>' + (key + 1) + '</td><td>' + domain.domainName + '</td><td>' + assigneeList + '</td><td>' +
                    generateAssigneeList(domain.assignee, localStorage.getItem("userListAsHtml")) + '<div class="form-group"> <div class="col-md-9 col-sm-9 col-xs-12"> ' +
                    ' </div></div></td><td>' + domain.assigner.name + '</td>' +
                    '<td><button type="button" class="btn btn-success btn-xs">ReAssign</button></td></tr>');
            });
        });
    }



    // $(document).on("click", ".assignBtn", function () {
    //     // console.log($(this).parent().parent().find("select").val());
    //     showLoadingTemplate();
    //     var assigneeList = [];
    //     var currentRow = $(this).parent().parent();
    //     $.each($(this).parent().parent().find("select").val(), function (key, assignee) {
    //         console.log(assignee);
    //         assigneeList.push({
    //             "userId": assignee
    //         });
    //     });

    //     var domainAssignList = {
    //         "domainId": $(this).data("value"),
    //         "assignee": assigneeList
    //     }


    //     $.ajax({
    //         url: authIP + "/assignDomain",
    //         type: "POST",
    //         contentType: "application/json",
    //         dataType: "json",
    //         data: JSON.stringify(domainAssignList),
    //         success: function (data) {
    //             currentRow.hide(1000);
    //             hideLoadingTemplate();
    //             alert("Domain successfull assigned to the selected users");
    //         },
    //         error: function (err) {
    //             hideLoadingTemplate();
    //             alert("Error assigning");
    //         }
    //     })
    // });

    function generateAssigneeList(assignedUserList, userList) {
        userList = JSON.parse(userList);
        var select = '<select class="select2_group form-control" multiple data-placeholder="Add tools"><option disabled value="" ' +
            'selected><i>Select</i></option>';
        if (assignedUserList !== undefined) {
            $.each(userList, function (key, user) {
                var isAdded = false;
                for (var assignee in assignedUserList) {
                    if (assignedUserList[assignee].userId === user.userId) {
                        select += '<option value="' + user.userId + '" selected>' + user.name + '</option>';
                        isAdded = true;
                    }
                }
                if (!isAdded)
                    select += '<option value="' + user.userId + '">' + user.name + '</option>';
            });
        } else {
            $.each(userList, function (key, user) {
                select += '<option value="' + user.userId + '">' + user.name + '</option>'
            });
        }
        select += '</select>';
        return select;
    }

});


function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    // console.log(jsonPayload)
    return JSON.parse(jsonPayload);
};



function getAllAssignedDomainsForUser(pageNumber) {
    $.get(authIP + "/getAllAssignedDomainsForUser", function (response) {
        hideLoadingTemplate();
        // console.log("## response ##")
        // console.log(response);
        $('#tab_content1 tbody').empty();

        for (let x of response) {

            let urlList = "";
            for (let url of x.domainUrlList) {
                if (url.inProgress === false) {
                    urlList += `<li>
                    <div class="row">
                        <div class="col-md-1">
                        <span>${url.id}</span>
                        </div>
                        <div class="col-md-8">
                        <p>${url.url}</p>    
                        </div>
                        <div class="col-md-3">
                       
                        </div>
                    </div>
                    </li>`;
                }

            }
            // start test button
            //  <button type="button" class="btn btn-success btn-xs a11y-start-testing" data-urlid=${url.id} onclick="startTestBtnClick(event)">Start Testing</button>    

            $("#tab_content1 tbody").append(`<tr><td>${x.id}</td><td>
            <div class="panel">
            <a class="panel-heading collapsed" role="tab" id="headingOne" data-toggle="collapse" data-parent="#accordion" href="#collapse${x.id}" aria-expanded="false" aria-controls="collapseOne">
                <h4 class="panel-title">${x.domainName}</h4>
            </a>
            <div id="collapse${x.id}" class="panel-collapse collapse" role="tabpanel" aria-labelledby="headingOne" aria-expanded="true" style="height: 0px;">
                <div class="panel-body">
                <ul class="to_do">
                ${urlList}
                </div>
            </div>
        </div>
           </td>
            <td>${x.runStartDate}</td>
           <td>
           <button type="button" class="btn btn-success btn-xs a11y-start-testing" data-domainId=${x.id} onclick="startTestBtnClick(event)">Start Testing</button>    
           </td>
            </tr>`)
        }
    });

}

function startTestBtnClick(event) {
    let domainId = event.target.getAttribute("data-domainId");
    let jsonData = new Object();
    jsonData.id = domainId;


    $.ajax({
        url: authIP + "/startDomainTesting",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(jsonData),
        success: function (data) {
            hideLoadingTemplate();
            alert(data);
            getAllAssignedDomainsForUser(1)
        },
        error: function (err) {
            hideLoadingTemplate();
            alert("Error during status update");
        }
    });

}

function completeTestBtn(event) {
    event.target.disabled = true;
    let domainId = event.target.getAttribute("data-domainId");
    let jsonData = new Object();
    jsonData.id = domainId;
    $.ajax({
        url: authIP + "/completeDomainTesting",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(jsonData),
        success: function (data) {
            hideLoadingTemplate();
            alert("Domain successfull added to the completed list");

            getAllAssingedInprogressUrlsForUser();
            //  resetting the mailstatus button after clicking complete button.

            mailListClickbtns = [];
            mailListMarkCount = 0;
            currentDomainId = 0;

        },
        error: function (err) {
            hideLoadingTemplate();
            alert("Error during status update");
        }
    });
}

function getAllAssingedInprogressUrlsForUser() {
    $.get(authIP + "/getAllAssignedInprogressDomainAndUrlForUser", function (response) {
        hideLoadingTemplate();
        // console.log(response)

        $('#tab_content2 tbody').empty();

        for (let x of response) {
            let urlList = "";
            for (let url of x.domainUrlList) {
                if (url.inProgress === true) {
                    urlList += `
                    
                    <a class="panel-heading" role="tab" id="headingOne-${url.id}" data-domainId=${x.id} data-url=${url.url} data-id=${url.id} onclick="fetchFiveUrlErrors(event)" data-toggle="collapse" data-parent="#accordion" href="#collapseOne-${url.id}" aria-expanded="true" aria-controls="collapseOne">
                        <div class="row">
                            <div class="col-md-1">
                                <span>${url.id}</span>
                            </div>
                            <div class="col-md-8">
                                <h4 class="panel-title">${url.url}</h4>
                            </div>
                            <div class="col-md-3">
                            <a data-url="${url.url}" data-urlid="${url.id}" data-domainid="${x.id}" target="_blank" class="btn btn-danger btn-xs url-opn-btn" disabled >Open</a>
                            </div>
                        </div>
                    </a>
                    <div id="collapseOne-${url.id}" class="panel-collapse collapse" role="tabpanel" aria-labelledby="headingOne-${url.id}" aria-expanded="true" style="height: 0px;">
                        <div class="panel-body">
                           <div id="a11y-url-error-list-${url.id}"> </div>
                        </div>
                    </div>
            `;
                }

            }
            // console.log(urlList)
            // $("#assigned-domain-for-user-accordion").append(`
            $("#tab_content2 tbody").append(`<tr><td>${x.id}</td><td>
            <div class="panel">
            <a class="panel-heading collapsed" role="tab" id="headingOne" data-toggle="collapse" data-parent="#accordion" href="#collapse${x.id}" aria-expanded="false" aria-controls="collapseOne">
                <h4 class="panel-title">${x.domainName}</h4>
            </a>
            <div id="collapse${x.id}" class="panel-collapse collapse" role="tabpanel" aria-labelledby="headingOne" aria-expanded="true" style="height: 0px;">
                <div class="panel-body">
                
                <div class="accordion" id="assigned-domain-urls-for-user-accordion" role="tablist" aria-multiselectable="true">
                    <div class="panel">
                    ${urlList}
                    </div>
                </div>
                </div>
            </div>
        </div>
           </td> <td></td>
           <td>
           <button type="button" class="btn btn-success btn-xs a11y-complete-testing" data-domainId=${x.id} onclick="completeTestBtn(event)" disabled>Complete</button>
           </td>
            </tr>`)
        }
    });










    //     $('#tab_content2 tbody').empty();
    //     for (let x of response) {
    //         $("#tab_content2 tbody").append(`<tr>
    //             <td>${x.id}</td>
    //             <td>${x.url}</td>
    //             <td></td>
    //             <td><button type="button" class="btn btn-success btn-xs a11y-complete-testing" data-urlid=${x.id} onclick="completeTestBtn(event)">Complete Testing</button></td></td>
    //         </tr>`);
    //     }

    // });
}
function getAllAssignedCompletedUrlsForUser() {
    $.get(authIP + "/getAllAssignedCompletedDomainAndUrlsForUser", function (response) {
        hideLoadingTemplate();
        $('#tab_content3 tbody').empty();

        // console.log(response)
        for (let x of response) {

            let urlList = "";
            for (let url of x.domainUrlList) {
                if (url.completed === true) {
                    urlList += `<li>
                    <div class="row">
                        <div class="col-md-1">
                        <span>${url.id}</span>
                        </div>
                        <div class="col-md-8">
                        <p>${url.url}</p>    
                        </div>
                        <div class="col-md-3">
                      
                        </div>
                    </div>
                    </li>`;
                }

            }
            // console.log(urlList)
            // $("#assigned-domain-for-user-accordion").append(`
            $("#tab_content3 tbody").append(`<tr><td>${x.id}</td><td>
            <div class="panel">
            <a class="panel-heading collapsed" role="tab" id="a11y-completed-domains-${x.id}" data-toggle="collapse" data-parent="#accordion" href="#a11y-completed-${x.id}" aria-expanded="false" aria-controls="a11y-completed-${x.id}">
                <h4 class="panel-title">${x.domainName}</h4>
            </a>
            <div id="a11y-completed-${x.id}" class="panel-collapse collapse" role="tabpanel" aria-labelledby="a11y-completed-domains-${x.id}" aria-expanded="true" style="height: 0px;">
                <div class="panel-body">
                <ul class="to_do">
                ${urlList}
                </div>
            </div>
        </div>
           </td> 
           ${(x.completed === true) ? "<td style='color:green'>Completed</td>" : "<td>Not Completed</td>"}
            </tr>`)
        }

        // for (let x of response) {
        //     $("#tab_content3 tbody").append('<tr> <td>' + (x.urlId) + '</td><td>' + x.url + '</td><td>' + x.assignedTime + '</td>' +
        //         '<td><button type="button" class="btn btn-success btn-xs a11y-complete-testing" data-urlid=' + x.urlId + ' onclick="completeTestBtn(event)">Complete Testing</button></td></tr>');

        // }

    });
}
function hideUserTab() {
    document.querySelectorAll(".row.tile_count")[0].firstElementChild.style.display = "none";
    "none";
}

function hideReportTab() {
    document.querySelectorAll(".row.tile_count")[0].lastElementChild.style.display = "none";
    "none";
}

function hideAllSidePanelMenusForUser() {
    $(".nav.side-menu>li").slice(1).each((i, element) => {
        element.style.display = "none";
    });
}

function removeUnwantedElementsForUser() {
    hideUserTab();
    hideReportTab();
    hideAllSidePanelMenusForUser();
}

function displayUsername(username) {
    if (username !== "" || username != undefined)
        $('#a11y-tester-username').html(`Welcome ${username}`);
}



function changeWebContentForSuperAdmin() {
    $("#todo-tab").html("Domains");
    // change the panel column to Assigned user
    document.querySelectorAll("#tab_content2 table thead tr>th")[2].innerHTML = "Assigned User";
    document.querySelectorAll("#tab_content3 table thead tr>th")[3].innerHTML = "Status";
    // document.querySelectorAll('#a11y-domain-pending thead tr th')[2].innerHTML = "Assigned To";
    // document.querySelectorAll("#a11y-domain-pending thead tr th")[3].innerHTML = "Status";

}
function changeWebContentForUsers() {
    document.querySelectorAll("#tab_content3 table thead tr th")[2].innerHTML = "Domain Status"
    "Domain Status";
    document.querySelectorAll("#tab_content3 table thead tr th")[3].style.display = "none";
    document.querySelectorAll("#a11y-domain-pending thead tr th")[2].style.display = "none"
    // document.querySelectorAll("#a11y-domain-pending thead tr th")[3].style.display = "none"
    document.querySelectorAll("#a11y-domain-pending thead tr th")[4].style.display = "none"

}

// ---------------- SUPER ADMIN REQUESTS START-----------------------
function getAllInProgressDomainAndUrlForSuperAdmin() {
    $.get(authIP + "/getAllInProgressDomainAndUrlForSuperAdmin", function (response) {

        hideLoadingTemplate();
        // console.log(response)
        $('#tab_content2 tbody').empty();
        for (let x of response) {

            let urlList = "";
            for (let url of x.domainUrlList) {
                if (url.inProgress === true) {
                    urlList += `<li>
                    <div class="row">
                        <div class="col-md-1">
                        <span>${url.id}</span>
                        </div>
                        <div class="col-md-8">
                        <p>${url.url}</p>    
                        </div>
                        <div class="col-md-3">
                       
                        </div>
                    </div>
                    </li>`;
                }

            }
            // console.log(urlList)
            // $("#assigned-domain-for-user-accordion").append(`
            $("#tab_content2 tbody").append(`<tr><td>${x.id}</td><td>
            <div class="panel">
            <a class="panel-heading collapsed" role="tab" id="a11y-inprogress-domains-${x.id}" data-toggle="collapse" data-parent="#accordion" href="#a11y-inprogress-${x.id}" aria-expanded="false" aria-controls="a11y-inprogress-${x.id}">
                <h4 class="panel-title">${x.domainName}</h4>
            </a>
            <div id="a11y-inprogress-${x.id}" class="panel-collapse collapse" role="tabpanel" aria-labelledby="a11y-inprogress-domains-${x.id}" aria-expanded="true" style="height: 0px;">
                <div class="panel-body">
                <ul class="to_do">
                ${urlList}
                </div>
            </div>
        </div>
           </td> 
           <td> ${x.assignedUserId.name}</td>
           <td></td>
            </tr>`)
        }


    });
}

function getAllCompletedDomainAndUrlsForSuperAdmin() {
    $.get(authIP + "/getAllCompletedDomainAndUrlsForSuperAdmin", function (response) {

        hideLoadingTemplate();
        // console.log(response)
        $('#tab_content3 tbody').empty();

        for (let x of response) {

            let urlList = "";
            for (let url of x.domainUrlList) {
                if (url.completed === true) {
                    urlList += `<li>
                    <div class="row">
                        <div class="col-md-1">
                        <span>${url.id}</span>
                        </div>
                        <div class="col-md-8">
                        <p>${url.url}</p>    
                        </div>
                        <div class="col-md-3">
                      
                        </div>
                    </div>
                    </li>`;
                }

            }
            $("#tab_content3 tbody").append(`<tr><td>${x.id}</td><td>
            <div class="panel">
            <a class="panel-heading collapsed" role="tab" id="a11y-completed-domains-${x.id}" data-domainId=${x.id} data-toggle="collapse" data-parent="#accordion" href="#a11y-completed-${x.id}" aria-expanded="false" aria-controls="a11y-completed-${x.id}">
                <h4 class="panel-title">${x.domainName}</h4>
            </a>
            <div id="a11y-completed-${x.id}" class="panel-collapse collapse" role="tabpanel" aria-labelledby="a11y-completed-domains-${x.id}" aria-expanded="true" style="height: 0px;">
                <div class="panel-body">
                <ul class="to_do">
                ${urlList}
                </div>
            </div>
        </div>
           </td>
            <td>${x.assignedUserId.name}</td>
            ${(x.completed === true) ? "<td style='color:green'>Completed</td>" : "<td>Not Completed</td>"}
            </tr>`)
        }


    });
}

// ---------------- SUPER ADMIN REQUESTS END-----------------------


function fetchFiveUrlErrors(event) {
    // console.log("clicked on url errror isting ");

    // console.log(event.target)
    // console.log(event.target.parentNode)
    // console.log(event.target.innerHTML);
    let url = "";
    let urlId = "";
    let domainId = "";
    if (event.target.tagName === "SPAN") {
        // console.log("clicked on span")
        // console.log(event.target.parentNode.parentNode.parentNode)
        url = event.target.parentNode.parentNode.getAttribute("data-url");
        urlId = event.target.parentNode.parentNode.getAttribute("data-id");
        domainId = event.target.parentNode.parentNode.getAttribute("data-domainId");
        // console.log(domainId)
    } else if (event.target.tagName === "DIV") {
        // console.log("clicked on div")
        // console.log(event.target.parentNode);
        url = event.target.parentNode.getAttribute('data-url');
        urlId = event.target.parentNode.getAttribute('data-id');
        domainId = event.target.parentNode.getAttribute('data-domainId');
        // console.log(domainId)
    } else if (event.target.tagName === "H4") {
        // console.log("Clicked on a")
        // console.log(event.target.parentNode.parentNode.parentNode)
        url = event.target.parentNode.parentNode.getAttribute("data-url");
        urlId = event.target.parentNode.parentNode.getAttribute("data-id");
        domainId = event.target.parentNode.parentNode.getAttribute("data-domainId");
        // console.log(domainId)
    }

    let errorContainerDivId = `a11y-url-error-list-${urlId}`;
    let errorContainerDiv = document.getElementById(errorContainerDivId);

    let jsonData = new Object();
    jsonData.url = url;

    $.ajax({
        url: "http://192.168.35.30:7555/fetchdata",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(jsonData),
        success: function (response) {
            response = JSON.parse(response)
            // console.log(response)
            let element = "";
            let disableButton = "";
            // check the max number of marked errors
            if (currentDomainId == 0) {
                disableButton = "";
            } else if (domainId == currentDomainId) {
                if (mailListMarkCount == 2) {
                    disableButton = "disabled";
                } else {
                    disableButton = "";
                }
            } else {
                disableButton = "disabled";
            }
            // disableButton = (mailListMarkCount == 2 || (currentDomainId != 0 && (currentDomainId != domainId))) ? "disabled" : "";
            response.map((item, key) => {
                let markBtn = "";
                let unmarkBtn = "";
                if (item.mail_status == 1) {
                    unmarkBtn = "";
                    if (currentDomainId == 0) {
                        markBtn = "disabled";
                    } else {
                        markBtn = "disabled";
                    }
                } else {
                    unmarkBtn = "disabled";
                    if (currentDomainId == 0) {
                        markBtn = "";
                    } else {
                        markBtn = "disabled";
                    }
                }
                // display priority 
                let priorityElement = "";
                if (item.priority == "High") {
                    priorityElement = `<span class="label label-danger a11y-priority-span"> HIGH </span>`;
                } else if (item.priority == "Medium") {
                    priorityElement = `<span class="label label-warning a11y-priority-span">MEDIUM</span>`;
                } else if (item.priority == "Low") {
                    priorityElement = `<span class="label label-success a11y-priority-span">LOW</span>`;

                }

                element += `
                <div class="row">
                    <div class="col-md-1">${key + 1}</div>
                    <div class="col-md-9"><span class="a11y-testcase-p">${item.test_case}</span> ${(item.test_type == "Auto") ? '<span class="label label-primary">Auto</span>' : ""} ${priorityElement} </div>
                    <div class="col-md-2"> 
                    <button type="button" data-errorId=${item.id} data-domainId=${domainId} onclick="changeErrorMailStatus(event)" class="btn btn-success a11y-mark-button btn-xs"  ${markBtn} >mark</button>
                    <button type="button" data-errorId=${item.id} data-domainId=${domainId} onclick="resetErrorMailStatus(event)" class="btn btn-danger a11y-unmark-button btn-xs" ${unmarkBtn} >Un-mark</button>
                    </div>
                </div>`;
            });
            errorContainerDiv.innerHTML = element;

            validateOpenUrlBtn(urlId)
            // for open button on loading
            validateOpenButonOnLoad(urlId)
            // for complete button
            validateCompleteButtonOnMultipleUrls(urlId)

        },
        error: function (err) {

            console.log("error ", err)
        }
    });
}

function changeErrorMailStatus(event) {
    let errorId = event.target.getAttribute("data-errorId");
    let domainId = event.target.getAttribute("data-domainId");
    let urlId = event.target.closest("[id^='a11y-url-error-list-']").getAttribute("id").replace("a11y-url-error-list-", "");
    let jsonData = new Object();
    jsonData.id = errorId;
    jsonData.status = "1";

    $.ajax({
        url: "http://192.168.35.30:7555/update",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(jsonData),
        success: function (response) {
            // console.log(response)
            alert("marked for report generation")
            mailListMarkCount++;
            mailListClickbtns.push(errorId);
            currentDomainId = domainId;

            // check for any error list are opend with other domains. if any open disable its button.
            document.querySelectorAll(`button[class="${event.target.getAttribute("class")}"]`).forEach(markButton => {
                // console.log(markButton.getAttribute("data-domainId"));
                if (markButton.getAttribute("data-domainId") != currentDomainId) {
                    markButton.disabled = true;
                }
            })

            // disabling the current mark button
            event.target.disabled = true;

            // enabling the current unmark button
            event.target.nextElementSibling.disabled = false;

            // disable all mark button when mark button click =2
            if (mailListClickbtns.length == 2) {
                // console.log(event.target.getAttribute("class"))
                document.querySelectorAll(`button[class="${event.target.getAttribute("class")}"]`).forEach(markButton => markButton.disabled = true);
                document.querySelectorAll(`button[class="btn btn-success btn-xs a11y-complete-testing"][data-domainId="${currentDomainId}"]`)[0].disabled = false;
            }

            clickOnEachMarkButton(urlId)
        },
        error: function (err) {
            console.log("error ", err)
        }
    });
}

function resetErrorMailStatus(event) {

    let errorId = event.target.getAttribute("data-errorId");
    let domainId = event.target.getAttribute("data-domainId");
    let urlId = event.target.closest("[id^='a11y-url-error-list-']").getAttribute("id").replace("a11y-url-error-list-", "");
    // console.log(`error id to remove :  ${errorId}`)
    let jsonData = new Object();
    jsonData.id = errorId;
    jsonData.status = "0";
    $.ajax({
        url: "http://192.168.35.30:7555/update",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(jsonData),
        success: function (response) {
            // console.log(response);
            mailListMarkCount--;
            event.target.disabled = true;
            alert("unmarked from report generation!");
            // remove current error id from the mailListClickbtns
            mailListClickbtns.splice(mailListClickbtns.indexOf(errorId), 1)
            // console.log(mailListClickbtns)
            // enable all mark button other than one if single one is selected
            document.querySelectorAll(`button[class="btn btn-success a11y-mark-button btn-xs"][data-domainId="${domainId}"]`).forEach(markBtn => markBtn.disabled = false);
            if (mailListClickbtns.length == 1)
                document.querySelectorAll(`button[class="btn btn-success a11y-mark-button btn-xs"][data-errorId="${mailListClickbtns[0]}"]`)[0].disabled = true;
            if (mailListClickbtns.length == 0) {
                currentDomainId = 0;
            }
            // // disable all complete test button 
            // document.querySelectorAll(`button[class="btn btn-success btn-xs a11y-complete-testing"]`).forEach(completeBtn => completeBtn.disabled = true);
            // enable all mark button if no domain is selected.
            if (currentDomainId == 0) {
                document.querySelectorAll(`button[class="btn btn-success a11y-mark-button btn-xs"]`).forEach(markBtn => markBtn.disabled = false);
            }

            clickOnEachUnMarkButton(urlId, errorId)
        },
        error: ((error) => {
            console.log("Error occuring resetting the mail status");
        })

    });
}

function validateOpenUrlBtn(urlId) {
    let allUnmarkBtn = document.querySelectorAll(`div[id="a11y-url-error-list-${urlId}"] button[class="btn btn-danger a11y-unmark-button btn-xs"]`)
    let allMarkBtn = document.querySelectorAll(`div[id="a11y-url-error-list-${urlId}"] button[class="btn btn-success a11y-mark-button btn-xs"]`)

    let unmarkCount = 0;
    allUnmarkBtn.forEach((item) => {
        if (!item.disabled) {
            unmarkCount++;
        }
    });
    console.log(unmarkCount)
    if (unmarkCount == 2) {
        allMarkBtn.forEach((item) => {
            item.disabled = true;
        })
        //  enable open button
        let opnBtn = document.querySelectorAll(`a[class="btn btn-danger btn-xs url-opn-btn"][data-urlid="${urlId}"]`)[0];
        opnBtn.setAttribute("href", opnBtn.getAttribute("data-url"));
        opnBtn.removeAttribute("disabled");
        if (unmarkCount >= 1 && unmarkCount <= 2) {
            // enable complete domain button
            let domainId = document.querySelector(`a[id='headingOne-${urlId}']`).getAttribute("data-domainid");
            document.querySelector(`button[class="btn btn-success btn-xs a11y-complete-testing"][data-domainid="${domainId}"]`).disabled = false;

        }


    } else if (unmarkCount <= 0) {
        allMarkBtn.forEach((item) => {
            item.disabled = false;
        });
        // disable complete button
        let domainId = document.querySelector(`a[id='headingOne-${urlId}']`).getAttribute("data-domainid");
        document.querySelector(`button[class="btn btn-success btn-xs a11y-complete-testing"][data-domainid="${domainId}"]`).disabled = true;
    }
    else if (unmarkCount >= 3) {
        //disable all other markbutton
        allMarkBtn.forEach((item) => {
            item.disabled = true;
        });
        //disable open button 
        // disable complete button
        let domainId = document.querySelector(`a[id='headingOne-${urlId}']`).getAttribute("data-domainid");
        document.querySelector(`button[class="btn btn-success btn-xs a11y-complete-testing"][data-domainid="${domainId}"]`).disabled = true;


    }


}

function clickOnEachMarkButton(urlId) {
    let allUnmarkBtn = document.querySelectorAll(`div[id="a11y-url-error-list-${urlId}"] button[class="btn btn-danger a11y-unmark-button btn-xs"]`)
    let allMarkBtn = document.querySelectorAll(`div[id="a11y-url-error-list-${urlId}"] button[class="btn btn-success a11y-mark-button btn-xs"]`)
    let disabledUnmarkCount = 0;
    allUnmarkBtn.forEach((item) => {
        if (!item.disabled) {
            disabledUnmarkCount++;
        }
    });
    if (disabledUnmarkCount >= 2) {
        allMarkBtn.forEach((item) => {
            item.disabled = true;
        })
    }
    if (disabledUnmarkCount == 1 || disabledUnmarkCount == 2) {
        let opnBtn = document.querySelectorAll(`a[class="btn btn-danger btn-xs url-opn-btn"][data-urlid="${urlId}"]`)[0];
        opnBtn.setAttribute("href", opnBtn.getAttribute("data-url"));
        opnBtn.removeAttribute("disabled");
        if (disabledUnmarkCount >= 1 && disabledUnmarkCount <= 2) {
            let domainId = document.querySelector(`a[id='headingOne-${urlId}']`).getAttribute("data-domainid");
            document.querySelector(`button[class="btn btn-success btn-xs a11y-complete-testing"][data-domainid="${domainId}"]`).disabled = false;

        } else {
            let domainId = document.querySelector(`a[id='headingOne-${urlId}']`).getAttribute("data-domainid");
            document.querySelector(`button[class="btn btn-success btn-xs a11y-complete-testing"][data-domainid="${domainId}"]`).disabled = true;

        }
    } else {
        let opnBtn = document.querySelectorAll(`a[class="btn btn-danger btn-xs url-opn-btn"][data-urlid="${urlId}"]`)[0];
        opnBtn.removeAttribute("href");
        opnBtn.setAttribute("disabled", true);
        //  disable complete button
        let domainId = document.querySelector(`a[id='headingOne-${urlId}']`).getAttribute("data-domainid");
        document.querySelector(`button[class="btn btn-success btn-xs a11y-complete-testing"][data-domainid="${domainId}"]`).disabled = false;


    }

    // for complete button on different url.
    let allMarkButtonDomain = document.getElementById(`headingOne-${urlId}`).closest('tr').querySelectorAll('button[class="btn btn-success a11y-mark-button btn-xs"]');
    console.log(allMarkButtonDomain)
    let markDisabledCount = 0;
    allMarkButtonDomain.forEach((item) => {
        if (item.disabled == true) {
            console.log("marked")
            markDisabledCount++;
        }
    })
    if (markDisabledCount >= 2) {
        allMarkButtonDomain.forEach((item) => {
            item.disabled = true;
        });
    } else if (markDisabledCount > 0 && markDisabledCount <= 2) {
        // enable open button
    }
    if (markDisabledCount >= 1 && markDisabledCount <= 2) {
        // enable complete button
        let domainId = document.querySelector(`a[id='headingOne-${urlId}']`).getAttribute("data-domainid");
        document.querySelector(`button[class="btn btn-success btn-xs a11y-complete-testing"][data-domainid="${domainId}"]`).disabled = false;
    } else {
        // disable complete button
        let domainId = document.querySelector(`a[id='headingOne-${urlId}']`).getAttribute("data-domainid");
        document.querySelector(`button[class="btn btn-success btn-xs a11y-complete-testing"][data-domainid="${domainId}"]`).disabled = true;
    }

    checkTotalMailStatusMark(urlId);
}

function clickOnEachUnMarkButton(urlId) {
    let allUnmarkBtn = document.querySelectorAll(`div[id="a11y-url-error-list-${urlId}"] button[class="btn btn-danger a11y-unmark-button btn-xs"]`)
    let allMarkBtn = document.querySelectorAll(`div[id="a11y-url-error-list-${urlId}"] button[class="btn btn-success a11y-mark-button btn-xs"]`)
    let disabledUnmarkCount = 0;
    let enabledUnmarkCount = 0;

    allUnmarkBtn.forEach((item) => {
        if (!item.disabled) {
            disabledUnmarkCount++;
        }
    });
    if (disabledUnmarkCount >= 2) {
        allMarkBtn.forEach((item) => {
            item.disabled = true;
        })
        if (disabledUnmarkCount == 2) {
            let opnBtn = document.querySelectorAll(`a[class="btn btn-danger btn-xs url-opn-btn"][data-urlid="${urlId}"]`)[0];
            opnBtn.setAttribute("href", opnBtn.getAttribute("data-url"));
            opnBtn.removeAttribute("disabled");
            // enable complete button
            let domainId = document.querySelector(`a[id='headingOne-${urlId}']`).getAttribute("data-domainid");
            document.querySelector(`button[class="btn btn-success btn-xs a11y-complete-testing"][data-domainid="${domainId}"]`).disabled = false;
        } else {
            let opnBtn = document.quelmyrajuerySelectorAll(`a[class="btn btn-danger btn-xs url-opn-btn"][data-urlid="${urlId}"]`)[0];
            opnBtn.removeAttribute("href");
            opnBtn.setAttribute("disabled", true);
        }
    } else if (disabledUnmarkCount >= 1 && disabledUnmarkCount <= 2) {
        let errorId = [];
        allUnmarkBtn.forEach((item) => {
            if (!item.disabled) {
                errorId.push(item.getAttribute('data-errorid'));
            }
        });
        for (x of errorId) {
            document.querySelectorAll(`button[class="btn btn-success a11y-mark-button btn-xs"][data-errorid='${x}']`)[0].disabled = true;
        }
     

    } else if (disabledUnmarkCount <= 0) {
        let opnBtn = document.querySelectorAll(`a[class="btn btn-danger btn-xs url-opn-btn"][data-urlid="${urlId}"]`)[0];
        opnBtn.removeAttribute("href");
        opnBtn.setAttribute("disabled", true);
        // disable complete button
        let domainId = document.querySelector(`a[id='headingOne-${urlId}']`).getAttribute("data-domainid");
        document.querySelector(`button[class="btn btn-success btn-xs a11y-complete-testing"][data-domainid="${domainId}"]`).disabled = true;
    }
    if (disabledUnmarkCount >= 1 && disabledUnmarkCount <= 2) {
        let domainId = document.querySelector(`a[id='headingOne-${urlId}']`).getAttribute("data-domainid");
        document.querySelector(`button[class="btn btn-success btn-xs a11y-complete-testing"][data-domainid="${domainId}"]`).disabled = false;

    } else {
        let domainId = document.querySelector(`a[id='headingOne-${urlId}']`).getAttribute("data-domainid");
        console.log(domainId)
        document.querySelector(`button[class="btn btn-success btn-xs a11y-complete-testing"][data-domainid="${domainId}"]`).disabled = true;
    }

    if (enabledUnmarkCount >= 1 && enabledUnmarkCount <= 2) {
        // disable complete button
        let domainId = document.querySelector(`a[id='headingOne-${urlId}']`).getAttribute("data-domainid");
        document.querySelector(`button[class="btn btn-success btn-xs a11y-complete-testing"][data-domainid="${domainId}"]`).disabled = false;
    } else {
        // disable complete button
        let domainId = document.querySelector(`a[id='headingOne-${urlId}']`).getAttribute("data-domainid");
        document.querySelector(`button[class="btn btn-success btn-xs a11y-complete-testing"][data-domainid="${domainId}"]`).disabled = true;
    }




       // complete button fix
       let allUnMarkButtonDomain = document.getElementById(`headingOne-${urlId}`).closest('tr').querySelectorAll('button[class="btn btn-danger a11y-unmark-button btn-xs"]');

       let unmarkBtnActiveCount = 0;

       allUnMarkButtonDomain.forEach((item) => {
           if (item.disabled == false) {
               unmarkBtnActiveCount++;
           }
       });


       if (unmarkBtnActiveCount >= 1 && unmarkBtnActiveCount <= 2) {
           // enable complete button
           let domainId = document.querySelector(`a[id='headingOne-${urlId}']`).getAttribute("data-domainid");
           document.querySelector(`button[class="btn btn-success btn-xs a11y-complete-testing"][data-domainid="${domainId}"]`).disabled = false;
       } else {
           // disable complete button
           let domainId = document.querySelector(`a[id='headingOne-${urlId}']`).getAttribute("data-domainid");
           document.querySelector(`button[class="btn btn-success btn-xs a11y-complete-testing"][data-domainid="${domainId}"]`).disabled = true;
       }

       // complete button fix end
}

function validateCompleteButtonOnMultipleUrls(urlId) {
    let allMarkButtonDomain = document.getElementById(`headingOne-${urlId}`).closest('tr').querySelectorAll('button[class="btn btn-success a11y-mark-button btn-xs"]');
    console.log(allMarkButtonDomain)
    let markDisabledCount = 0;
    let markForUrlCount = 0;
    allMarkButtonDomain.forEach((item) => {
        if (item.disabled == true) {
            console.log("marked")
            markDisabledCount++;
        }
    })
    if (markDisabledCount >= 2) {
        allMarkButtonDomain.forEach((item) => {
            item.disabled = true;
        });
    }

    if (markDisabledCount >= 1 && markDisabledCount <= 2) {
        // enable complete button
        let domainId = document.querySelector(`a[id='headingOne-${urlId}']`).getAttribute("data-domainid");
        document.querySelector(`button[class="btn btn-success btn-xs a11y-complete-testing"][data-domainid="${domainId}"]`).disabled = false;
    } else {
        // disable complete button
        let domainId = document.querySelector(`a[id='headingOne-${urlId}']`).getAttribute("data-domainid");
        document.querySelector(`button[class="btn btn-success btn-xs a11y-complete-testing"][data-domainid="${domainId}"]`).disabled = true;
    }

    // unmark test

    let allUnMarkButtonDomain = document.getElementById(`headingOne-${urlId}`).closest('tr').querySelectorAll('button[class="btn btn-danger a11y-unmark-button btn-xs"]');

    let unmarkBtnActiveCount = 0;

    allUnMarkButtonDomain.forEach((item) => {
        if (item.disabled == false) {
            unmarkBtnActiveCount++;
        }
    });
    if (unmarkBtnActiveCount >= 2) {

        if (unmarkBtnActiveCount >= 1 && unmarkBtnActiveCount <= 2) {
            // enable complete button
            let domainId = document.querySelector(`a[id='headingOne-${urlId}']`).getAttribute("data-domainid");
            document.querySelector(`button[class="btn btn-success btn-xs a11y-complete-testing"][data-domainid="${domainId}"]`).disabled = false;
        } else {
            // disable complete button
            let domainId = document.querySelector(`a[id='headingOne-${urlId}']`).getAttribute("data-domainid");
            document.querySelector(`button[class="btn btn-success btn-xs a11y-complete-testing"][data-domainid="${domainId}"]`).disabled = true;
        }
    }


}

function validateOpenButonOnLoad(urlId) {
    let allMarkBtn = document.querySelectorAll(`div[id="a11y-url-error-list-${urlId}"] button[class="btn btn-success a11y-mark-button btn-xs"]`)
    let allUnmarkBtn = document.querySelectorAll(`div[id="a11y-url-error-list-${urlId}"] button[class="btn btn-danger a11y-unmark-button btn-xs"]`)
    let markCount = 0;
    let disabledUnmarkCount = 0;
    allUnmarkBtn.forEach((item) => {
        if (!item.disabled) {
            disabledUnmarkCount++;
        }
    });
    if (disabledUnmarkCount > 0 && disabledUnmarkCount <= 2) {
        //  enable open button
        let opnBtn = document.querySelectorAll(`a[class="btn btn-danger btn-xs url-opn-btn"][data-urlid="${urlId}"]`)[0];
        opnBtn.setAttribute("href", opnBtn.getAttribute("data-url"));
        opnBtn.removeAttribute("disabled");
    } else {
        let opnBtn = document.querySelectorAll(`a[class="btn btn-danger btn-xs url-opn-btn"][data-urlid="${urlId}"]`)[0];
        opnBtn.removeAttribute("href");
        opnBtn.setAttribute("disabled", true);
    }
}

function checkTotalMailStatusMark(urlId) {
    let allUnMarkButtonDomain = document.getElementById(`headingOne-${urlId}`).closest('tr').querySelectorAll('button[class="btn btn-danger a11y-unmark-button btn-xs"]');

    let unmarkBtnActiveCount = 0;

    allUnMarkButtonDomain.forEach((item) => {
        if (item.disabled == false) {
            unmarkBtnActiveCount++;
        }
    });
    if (unmarkBtnActiveCount >= 2) {
        // disable all mark button for the domain
        let allMarkButtonDomain = document.getElementById(`headingOne-${urlId}`).closest('tr').querySelectorAll('button[class="btn btn-success a11y-mark-button btn-xs"]');
        allMarkButtonDomain.forEach((item) => item.disabled = true)
        if (unmarkBtnActiveCount >= 1 && unmarkBtnActiveCount <= 2) {
            // enable complete button
            let domainId = document.querySelector(`a[id='headingOne-${urlId}']`).getAttribute("data-domainid");
            document.querySelector(`button[class="btn btn-success btn-xs a11y-complete-testing"][data-domainid="${domainId}"]`).disabled = false;
        } else {
            // disable complete button
            let domainId = document.querySelector(`a[id='headingOne-${urlId}']`).getAttribute("data-domainid");
            document.querySelector(`button[class="btn btn-success btn-xs a11y-complete-testing"][data-domainid="${domainId}"]`).disabled = true;
        }
    }
}
