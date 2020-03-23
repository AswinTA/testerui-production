

$(document).ready(function () {

    // domain register click event
    $('#a11y-admin-add-domain-btn').click((evt) => {


        if ($('#a11y-admin-add-domain').val() !== "") {

            let domainName = $('#a11y-admin-add-domain').val();
            let jsonData = new Object();
            jsonData.domainName = domainName;
            console.log(domainName)

            if (localStorage.getItem("domainUrls") !== null) {
                let urlArr = localStorage.getItem("domainUrls").split(",");
                console.log(urlArr);
                let jsonUrlArr = [];
                for(x of urlArr){
                    jsonUrlArr.push({"url":x});
                }
                jsonData.urls = jsonUrlArr;
            }

            console.log(jsonData)
            $.ajaxSetup({
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem("authtoken")
                }
            });
            $.ajax({
                type: "POST",
                contentType: 'application/json; charset=utf-8',
                url: authIP + "/addDomain",
                data: JSON.stringify(jsonData),
                success: function (result) {
                    console.log("SUCCESS: ", result);
                    $('#a11y-url-table').find('tbody').empty();
                    $('.a11y-domain-save-info').html('DOMAIN SAVED SUCCESSFULLY')
                },
                error: function (e) {
                    console.log("ERROR: ", e);

                },
                done: function (e) {
                    console.log("DONE");
                  
                }
            });

        } else {
            // $('#a11y-url-error-span').css('color','RED');
            // $("#a11y-url-error-span").html("Enter valid Domain");
            // $('#a11y-url-error-span').css('display','block');
        }

        localStorage.removeItem("domainUrls");
    });

    $('#a11y-url-add-btn').click((evt) => {



        if ($('#a11y-url-add-txtbox').val() !== "" && $('#a11y-admin-add-domain').val() !== "") {
            //     let url = new Object();
            let urlArr = [];
            // localStorage.setItem("domainUrls",$('#a11y-url-add-txtbox').val())
            // if(localStorage.getItem("domainUrls"))
            if (localStorage.getItem("domainUrls") === null) {
                urlArr.push($('#a11y-url-add-txtbox').val());

                localStorage.setItem("domainUrls", urlArr);
                $('#a11y-url-add-txtbox').val("");
                $('#a11y-url-table').css('display', 'block');
                let tableRow = $.parseHTML('<tr> <th class="a11y-row-id" scope="row">3</th> <td class="a11y-row-url">Larry</td><td>the Bird</td><td>@</td></tr>');
                $(tableRow).find('.a11y-row-id').html("1");
                $(tableRow).find('.a11y-row-url').html(urlArr[0]);
                $('#a11y-url-table').find('tbody').empty();
                $('#a11y-url-table').find('tbody').append(tableRow);
            } else {
                urlArr.push(localStorage.getItem("domainUrls"));
                urlArr.push($('#a11y-url-add-txtbox').val());
                localStorage.removeItem("domainUrls");
                localStorage.setItem("domainUrls", urlArr);
                $('#a11y-url-add-txtbox').val("");
                $('#a11y-url-table').css('display', 'block');
                $('#a11y-url-table').find('tbody').empty();
                urlArr = [];
                urlArr = localStorage.getItem("domainUrls").split(",");
                for (let x of urlArr) {
                    let tableRow = $.parseHTML('<tr> <th class="a11y-row-id" scope="row">3</th> <td class="a11y-row-url">Larry</td><td>the Bird</td><td>@</td></tr>');
                    $(tableRow).find('.a11y-row-id').html(urlArr.indexOf(x) + 1);
                    $(tableRow).find('.a11y-row-url').html(x);
                    $('#a11y-url-table').find('tbody').append(tableRow);
                }
            }
        } else {
            // $('#a11y-url-error-span').css('color','RED');
            // $("#a11y-url-error-span").html("Enter valid URL");
            // $('#a11y-url-error-span').css('display','none');
        }

    });




});