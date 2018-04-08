function getUrlParameter (sParam) {
  var sPageURL = decodeURIComponent(window.location.search.substring(1)),
    sURLVariables = sPageURL.split('&'),
    sParameterName,
    i
  for (i = 0; i < sURLVariables.length; i++) {
    sParameterName = sURLVariables[i].split('=')
    if (sParameterName[0] === sParam) {
      return sParameterName[1] === undefined ? true : sParameterName[1]
    }
  }
};

$('#user').attr('value', getUrlParameter('user'))

$(function () {
  $('#btnSendForm').click(function () {
    disableButton(true)
    hideLoader(false)
    $.ajax({
      type: 'POST',
      dataType: 'json',
      headers: {
        'Content-Type': 'application/json'
      },
      url: '/reset-password',
      data: JSON.stringify({
        'user': getUrlParameter('user'),
        'newPassword': $('#newPassword').val()
      }),
      success: function (success) {
        disableButton(false)
        hideLoader(true)
        $('#responseMessage').html('Your password has changed !')
      },
      error: function (error) {
        disableButton(false)
        hideLoader(true)
        $('#responseMessage').html('Unknown error, please try again later :(')
      }
    })
  })
})

function disableButton (disabled) {
  $('#btnSendForm').prop('disabled', disabled)
}

function hideLoader (show) {
  $('#loader').attr('hidden', show)
}
