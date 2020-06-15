var userArr = [];
$(document).ready(function () {
  $("#post-item").on("click", handleAddPost);
  $("#postItemModal").modal({backdrop: "static",keyboard: true,show: false});
  $("#scheduleMsgModal").modal({backdrop: "static",keyboard: true,show: false});
  $("#aggregatePolicyMoadal").modal({backdrop: "static",keyboard: true,show: false});
  $("#closeUploadModal").on("click", closeUploadModal);
  $("#uploadFile").on("change", handleSavePostItem);
  $("#searchUserInfo").on("click", searchUserInfo);
  $("#scheduleMsg").on("click", openScheduleModal);
  $("#closeScheduleForm").on("click", closeScheduleModal);
  $("#saveScheduleData").on("click", handleSaveScheduleData);
  $("#aggregatePolicy").on("click", handleAggregatePolicy);
  $("#performAggregate").on("click", performAggregate);
  $("#closeAggregateForm").on("click", closeAggregateForm);
  $("#addUserNames").on("click", addAggregateUsers);
  $("#selectDate").dateDropper({ roundtrip: true });
  $("#selectTime").timeDropper({ format: "H:mm" });
});

function closeUploadModal() {
  $("#uploadFile").val("");
  $("#postItemModal").modal("hide");
}

function getScheduleFormData() {
  var obj = {};
  obj.date = $("#selectDate").val();
  obj.time = $("#selectTime").val();
  obj.msg = $("#enterMsg").val();
  return obj;
}

function handleSaveScheduleData() {
  var formInfo = getScheduleFormData();

  $.ajax({
    type: "post",
    url: "/scheduleMsg",
    dataType: "json",
    data: formInfo,
    success: function (data) {
      console.log(data);
      console.log("scheduleMsg sucess", data);
      closeScheduleModal();
    },

    error: function (e) {
      console.log("scheduleMsg error", e);
    }
  });
}

function closeScheduleModal() {
  $("#enterMsg").val("");
  $("#selectDate").val("");
  $("#selectTime").val("");
  $("#scheduleMsgModal").modal("hide");
}

function openScheduleModal() {
  $("#scheduleMsgModal").modal("show");
}

function gettmpl() {
  return `
  <tr >
    <td>{{userName}}</td>
    <td >{{policyNumber}}</td>
    <td >{{policyEndDate}}</td>
    <td >{{policyStartDate}}</td>
    <td >{{category_name}}</td>
    <td >{{companyName}}</td>
  </tr>
  `;
}

function initialiseTmpl(eachData) {
  var template = Handlebars.compile(gettmpl());
  var d = template(eachData);
  return d;
}

function getPostFormData() {
  var obj = {};
  obj.file = $("#uploadFile").files[0];
  return obj;
}

function handleSavePostItem(e) {
  var data = {};

  var file = e.target.files[0];
  var formData = new FormData();
  formData.append("myfile", file);
  $.ajax({
    type: "post",
    url: "/upload",
    contentType: false,
    processData: false,
    data: formData,
    success: function (data) {
      console.log("--------- uploaded sucessfully----");
      closeItemModal();
    },
    error: function (e) {
      console.log("process error", e);
    }
  });
}

function getSearchTextData() {
  let obj = {};
  obj.text = $("#searchUser").val();
  return obj;
}

function searchUserInfo() {
  var searchedText = getSearchTextData();
  if (Object.keys(searchedText).length == 0) {
    $("#searchUser").val("");
    return;
  }

  $.ajax({
    type: "get",
    url: "/searchUser",
    data: searchedText,
    success: function (data) {
    
      if (data && data.err) {
        console.log("-----error while getting searched data--", data.err);
        return;
      }
      $("#searchUser").val("");
      if(data.result && data.result.length>0){
        renderPolicyInfo(data.result);
      }
      else{
        console.log('-----no user found ----')
      }
    },

    error: function (e) {
      console.log("process error", e);
    }
  });
}

function renderPolicyInfo(policyInfo) {
  // console.table(policyInfo);
  $("#prepenfData").empty();
  for (var key of policyInfo) {
    $("#prepenfData").prepend(initialiseTmpl(key));
  }
}

function closeItemModal() {
  $("#uploadFile").val("");
  $("#postItemModal").modal("hide");
}

function handleAddPost() {
  $("#postItemModal").modal("show");
}

function handleAggregatePolicy(){
  $('#aggregatePolicyMoadal').modal('show')
}

function closeAggregateForm(){
  $('#aggregateusersHldr').empty();
  $('#aggregateUserName').val('');
  userArr = [];
  $('#aggregatePolicyMoadal').modal('hide')
}

function performAggregate(){
  if(userArr.length == 0){
    console.log('-----please enter userName----');
    return;
  }
  $.ajax({
    type: "get",
    url: "/aggeregateUser",
    data: {userArr:userArr},
    success: function (data) {
    
      if (data && data.err) {
        console.log("-----error while getting searched data--", data.err);
        return;
      }
      closeAggregateForm();
      console.table('aggrgateusersData----',data.result)
      if(Object.keys(data.result).length>0){
        renderAggregateInfo(data.result);
      }
      else{
        $('#aggrgateusersHldr').empty();
        console.log('-----no user found ----')
      }
    },

    error: function (e) {
      console.log("process error", e);
    }
  });
}

function addAggregateUsers(){
  var userName = $('#aggregateUserName').val();
  if(userName){
    userArr = userArr.filter(function(eachUser){
      return eachUser !== userName;    
    });
    userArr.push(userName);
    $('#aggregateUserName').val('');
    renderUserNames()
  }
}

function renderUserNames(){
  $('#aggregateusersHldr').empty();
  for(var key in userArr){
    let obj = {};
    obj.id= key;
    obj.userName=userArr[key];
    $('#aggregateusersHldr').append(renderUserTmpl(obj));
    $('#userId_'+key).on('click',removeUsers);
  }
}

function removeUsers(){
  var userId = this.id.split('_')[1];
  userArr.splice(userId,1);
  renderUserNames()
}

function getUsertmpl() {
  return `
  <span class"frgHldrCls">
    <span class="userCls">{{userName}}
     <span id='userId_{{id}}' class="removeUserCls"></span>
    </span>

  </span>
  `;
}

function renderUserTmpl(eachData) {
  var template = Handlebars.compile(getUsertmpl());
  var d = template(eachData);
  return d;
}

function renderAggregateInfo(data){
  $('#aggrgateusersHldr').empty();
  for(var key in data){

    let name = key;
    for(var k of data[key]){
      k.userName = name;
      renderEachAggregate(k);
    }
  }
}

function renderEachAggregate(eachData){
  $('#aggrgateusersHldr').append(renderAggregateTemplate(eachData))
}

function getAggtmpl() {
  return `
  <tr >
    <td>{{userName}}</td>
    <td >{{policyNumber}}</td>
    <td >{{policyEndDate}}</td>
    <td >{{policyStartDate}}</td>
    <td >{{companyName}}</td>
    <td >{{premiumAmount}}</td>
  </tr>
  `;
}

function renderAggregateTemplate(eachData) {
  var template = Handlebars.compile(getAggtmpl());
  var d = template(eachData);
  return d;
}
