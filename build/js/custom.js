(function($, sr) {
  // debouncing function from John Hann
  // http://unscriptable.com/index.php/2009/03/20/debouncing-javascript-methods/
  var debounce = function(func, threshold, execAsap) {
    var timeout;

    return function debounced() {
      var obj = this,
        args = arguments;

      function delayed() {
        if (!execAsap)
          func.apply(obj, args);
        timeout = null;
      }

      if (timeout)
        clearTimeout(timeout);
      else if (execAsap)
        func.apply(obj, args);

      timeout = setTimeout(delayed, threshold || 100);
    };
  };

  // smartresize
  jQuery.fn[sr] = function(fn) {
    return fn ? this.bind('resize', debounce(fn)) : this.trigger(sr);
  };

})(jQuery, 'smartresize');
/**
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var CURRENT_URL = window.location.href.split('#')[0].split('?')[0],
  $BODY = $('body'),
  $MENU_TOGGLE = $('#menu_toggle'),
  $SIDEBAR_MENU = $('#sidebar-menu'),
  $SIDEBAR_FOOTER = $('.sidebar-footer'),
  $LEFT_COL = $('.left_col'),
  $RIGHT_COL = $('.right_col'),
  $NAV_MENU = $('.nav_menu'),
  $FOOTER = $('footer');



// Sidebar
function init_sidebar() {
  // TODO: This is some kind of easy fix, maybe we can improve this
  var setContentHeight = function() {
    // reset height
    $RIGHT_COL.css('min-height', $(window).height());

    var bodyHeight = $BODY.outerHeight(),
      footerHeight = $BODY.hasClass('footer_fixed') ? -10 : $FOOTER.height(),
      leftColHeight = $LEFT_COL.eq(1).height() + $SIDEBAR_FOOTER.height(),
      contentHeight = bodyHeight < leftColHeight ? leftColHeight : bodyHeight;

    // normalize content
    contentHeight -= $NAV_MENU.height() + footerHeight;

    $RIGHT_COL.css('min-height', contentHeight);
  };

  $SIDEBAR_MENU.find('a').on('click', function(ev) {
    console.log('clicked - sidebar_menu');
    var $li = $(this).parent();

    if ($li.is('.active')) {
      $li.removeClass('active active-sm');
      $('ul:first', $li).slideUp(function() {
        setContentHeight();
      });
    } else {
      // prevent closing menu if we are on child menu
      if (!$li.parent().is('.child_menu')) {
        $SIDEBAR_MENU.find('li').removeClass('active active-sm');
        $SIDEBAR_MENU.find('li ul').slideUp();
      } else {
        if ($BODY.is(".nav-sm")) {
          $SIDEBAR_MENU.find("li").removeClass("active active-sm");
          $SIDEBAR_MENU.find("li ul").slideUp();
        }
      }
      $li.addClass('active');

      $('ul:first', $li).slideDown(function() {
        setContentHeight();
      });
    }
  });

  // toggle small or large menu
  $MENU_TOGGLE.on('click', function() {
    console.log('clicked - menu toggle');

    if ($BODY.hasClass('nav-md')) {
      $SIDEBAR_MENU.find('li.active ul').hide();
      $SIDEBAR_MENU.find('li.active').addClass('active-sm').removeClass('active');
    } else {
      $SIDEBAR_MENU.find('li.active-sm ul').show();
      $SIDEBAR_MENU.find('li.active-sm').addClass('active').removeClass('active-sm');
    }

    $BODY.toggleClass('nav-md nav-sm');

    setContentHeight();

    $('.dataTable').each(function() {
      $(this).dataTable().fnDraw();
    });
  });

  // check active menu
  $SIDEBAR_MENU.find('a[href="' + CURRENT_URL + '"]').parent('li').addClass('current-page');

  $SIDEBAR_MENU.find('a').filter(function() {
    return this.href == CURRENT_URL;
  }).parent('li').addClass('current-page').parents('ul').slideDown(function() {
    setContentHeight();
  }).parent().addClass('active');

  // recompute content when resizing
  $(window).smartresize(function() {
    setContentHeight();
  });

  setContentHeight();

  // fixed sidebar
  if ($.fn.mCustomScrollbar) {
    $('.menu_fixed').mCustomScrollbar({
      autoHideScrollbar: true,
      theme: 'minimal',
      mouseWheel: {
        preventDefault: true
      }
    });
  }
};
// /Sidebar

var randNum = function() {
  return (Math.floor(Math.random() * (1 + 40 - 20))) + 20;
};


// Panel toolbox
$(document).ready(function() {
  $('.collapse-link').on('click', function() {
    var $BOX_PANEL = $(this).closest('.x_panel'),
      $ICON = $(this).find('i'),
      $BOX_CONTENT = $BOX_PANEL.find('.x_content');

    // fix for some div with hardcoded fix class
    if ($BOX_PANEL.attr('style')) {
      $BOX_CONTENT.slideToggle(200, function() {
        $BOX_PANEL.removeAttr('style');
      });
    } else {
      $BOX_CONTENT.slideToggle(200);
      $BOX_PANEL.css('height', 'auto');
    }

    $ICON.toggleClass('fa-chevron-up fa-chevron-down');
  });

  $('.close-link').click(function() {
    var $BOX_PANEL = $(this).closest('.x_panel');

    $BOX_PANEL.remove();
  });
});
// /Panel toolbox

// Tooltip
$(document).ready(function() {
  $('[data-toggle="tooltip"]').tooltip({
    container: 'body'
  });
});
// /Tooltip

// Progressbar
if ($(".progress .progress-bar")[0]) {
  $('.progress .progress-bar').progressbar();
}


// Accordion
$(document).ready(function() {
  $(".expand").on("click", function() {
    $(this).next().slideToggle(200);
    $expand = $(this).find(">:first-child");

    if ($expand.text() == "+") {
      $expand.text("-");
    } else {
      $expand.text("+");
    }
  });
});

// NProgress
if (typeof NProgress != 'undefined') {
  $(document).ready(function() {
    NProgress.start();
  });

  $(window).load(function() {
    NProgress.done();
  });
}


//hover and retain popover when on popover content
var originalLeave = $.fn.popover.Constructor.prototype.leave;
$.fn.popover.Constructor.prototype.leave = function(obj) {
  var self = obj instanceof this.constructor ?
    obj : $(obj.currentTarget)[this.type](this.getDelegateOptions()).data('bs.' + this.type);
  var container, timeout;

  originalLeave.call(this, obj);

  if (obj.currentTarget) {
    container = $(obj.currentTarget).siblings('.popover');
    timeout = self.timeout;
    container.one('mouseenter', function() {
      //We entered the actual popover – call off the dogs
      clearTimeout(timeout);
      //Let's monitor popover content instead
      container.one('mouseleave', function() {
        $.fn.popover.Constructor.prototype.leave.call(self, self);
      });
    });
  }
};

$('body').popover({
  selector: '[data-popover]',
  trigger: 'click hover',
  delay: {
    show: 50,
    hide: 400
  }
});


function gd(year, month, day) {
  return new Date(year, month - 1, day).getTime();
}

/* AUTOSIZE */

function init_autosize() {

  if (typeof $.fn.autosize !== 'undefined') {

    autosize($('.resizable_textarea'));

  }

};

/* PARSLEY */

function init_parsley() {

  if (typeof(parsley) === 'undefined') {
    return;
  }
  console.log('init_parsley');

  $ /*.listen*/ ('parsley:field:validate', function() {
    validateFront();
  });
  $('#demo-form .btn').on('click', function() {
    $('#demo-form').parsley().validate();
    validateFront();
  });
  var validateFront = function() {
    if (true === $('#demo-form').parsley().isValid()) {
      $('.bs-callout-info').removeClass('hidden');
      $('.bs-callout-warning').addClass('hidden');
    } else {
      $('.bs-callout-info').addClass('hidden');
      $('.bs-callout-warning').removeClass('hidden');
    }
  };

  $ /*.listen*/ ('parsley:field:validate', function() {
    validateFront();
  });
  $('#demo-form2 .btn').on('click', function() {
    $('#demo-form2').parsley().validate();
    validateFront();
  });
  var validateFront = function() {
    if (true === $('#demo-form2').parsley().isValid()) {
      $('.bs-callout-info').removeClass('hidden');
      $('.bs-callout-warning').addClass('hidden');
    } else {
      $('.bs-callout-info').addClass('hidden');
      $('.bs-callout-warning').removeClass('hidden');
    }
  };

  try {
    hljs.initHighlightingOnLoad();
  } catch (err) {}

};

/* SELECT2 */

function init_select2() {

  if (typeof(select2) === 'undefined') {
    return;
  }
  console.log('init_toolbox');

  $(".select2_single").select2({
    placeholder: "Select a state",
    allowClear: true
  });
  $(".select2_group").select2({});
  $(".select2_multiple").select2({
    maximumSelectionLength: 4,
    placeholder: "With Max Selection limit 4",
    allowClear: true
  });

};

/* DATERANGEPICKER */

function init_daterangepicker() {

  if (typeof($.fn.daterangepicker) === 'undefined') {
    return;
  }
  console.log('init_daterangepicker');

  var cb = function(start, end, label) {
    console.log(start.toISOString(), end.toISOString(), label);
    $('#reportrange span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
  };

  var optionSet1 = {
    startDate: moment().subtract(29, 'days'),
    endDate: moment(),
    minDate: '01/01/2012',
    maxDate: '12/31/2025',
    dateLimit: {
      days: 60
    },
    showDropdowns: true,
    showWeekNumbers: true,
    timePicker: false,
    timePickerIncrement: 1,
    timePicker12Hour: true,
    ranges: {
      'Today': [moment(), moment()],
      'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
      'Last 7 Days': [moment().subtract(6, 'days'), moment()],
      'Last 30 Days': [moment().subtract(29, 'days'), moment()],
      'This Month': [moment().startOf('month'), moment().endOf('month')],
      'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
    },
    opens: 'left',
    buttonClasses: ['btn btn-default'],
    applyClass: 'btn-small btn-primary',
    cancelClass: 'btn-small',
    format: 'MM/DD/YYYY',
    separator: ' to ',
    locale: {
      applyLabel: 'Submit',
      cancelLabel: 'Clear',
      fromLabel: 'From',
      toLabel: 'To',
      customRangeLabel: 'Custom',
      daysOfWeek: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
      monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      firstDay: 1
    }
  };

  $('#reportrange span').html(moment().subtract(29, 'days').format('MMMM D, YYYY') + ' - ' + moment().format('MMMM D, YYYY'));
  $('#reportrange').daterangepicker(optionSet1, cb);
  $('#reportrange').on('show.daterangepicker', function() {
    console.log("show event fired");
  });
  $('#reportrange').on('hide.daterangepicker', function() {
    console.log("hide event fired");
  });
  $('#reportrange').on('apply.daterangepicker', function(ev, picker) {
    console.log("apply event fired, start/end dates are " + picker.startDate.format('MMMM D, YYYY') + " to " + picker.endDate.format('MMMM D, YYYY'));
  });
  $('#reportrange').on('cancel.daterangepicker', function(ev, picker) {
    console.log("cancel event fired");
  });
  $('#options1').click(function() {
    $('#reportrange').data('daterangepicker').setOptions(optionSet1, cb);
  });
  $('#options2').click(function() {
    $('#reportrange').data('daterangepicker').setOptions(optionSet2, cb);
  });
  $('#destroy').click(function() {
    $('#reportrange').data('daterangepicker').remove();
  });

}

function init_daterangepicker_right() {

  if (typeof($.fn.daterangepicker) === 'undefined') {
    return;
  }
  console.log('init_daterangepicker_right');

  var cb = function(start, end, label) {
    console.log(start.toISOString(), end.toISOString(), label);
    $('#reportrange_right span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
  };

  var optionSet1 = {
    startDate: moment().subtract(29, 'days'),
    endDate: moment(),
    minDate: '01/01/2012',
    maxDate: '12/31/2025',
    dateLimit: {
      days: 60
    },
    showDropdowns: true,
    showWeekNumbers: true,
    timePicker: false,
    timePickerIncrement: 1,
    timePicker12Hour: true,
    ranges: {
      'Today': [moment(), moment()],
      'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
      'Last 7 Days': [moment().subtract(6, 'days'), moment()],
      'Last 30 Days': [moment().subtract(29, 'days'), moment()],
      'This Month': [moment().startOf('month'), moment().endOf('month')],
      'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
    },
    opens: 'right',
    buttonClasses: ['btn btn-default'],
    applyClass: 'btn-small btn-primary',
    cancelClass: 'btn-small',
    format: 'MM/DD/YYYY',
    separator: ' to ',
    locale: {
      applyLabel: 'Submit',
      cancelLabel: 'Clear',
      fromLabel: 'From',
      toLabel: 'To',
      customRangeLabel: 'Custom',
      daysOfWeek: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
      monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      firstDay: 1
    }
  };

  $('#reportrange_right span').html(moment().subtract(29, 'days').format('MMMM D, YYYY') + ' - ' + moment().format('MMMM D, YYYY'));

  $('#reportrange_right').daterangepicker(optionSet1, cb);

  $('#reportrange_right').on('show.daterangepicker', function() {
    console.log("show event fired");
  });
  $('#reportrange_right').on('hide.daterangepicker', function() {
    console.log("hide event fired");
  });
  $('#reportrange_right').on('apply.daterangepicker', function(ev, picker) {
    console.log("apply event fired, start/end dates are " + picker.startDate.format('MMMM D, YYYY') + " to " + picker.endDate.format('MMMM D, YYYY'));
  });
  $('#reportrange_right').on('cancel.daterangepicker', function(ev, picker) {
    console.log("cancel event fired");
  });

  $('#options1').click(function() {
    $('#reportrange_right').data('daterangepicker').setOptions(optionSet1, cb);
  });

  $('#options2').click(function() {
    $('#reportrange_right').data('daterangepicker').setOptions(optionSet2, cb);
  });

  $('#destroy').click(function() {
    $('#reportrange_right').data('daterangepicker').remove();
  });

}

function init_daterangepicker_single_call() {

  if (typeof($.fn.daterangepicker) === 'undefined') {
    return;
  }
  console.log('init_daterangepicker_single_call');

  $('#single_cal1').daterangepicker({
    singleDatePicker: true,
    singleClasses: "picker_1"
  }, function(start, end, label) {
    console.log(start.toISOString(), end.toISOString(), label);
  });
  $('#single_cal2').daterangepicker({
    singleDatePicker: true,
    singleClasses: "picker_2"
  }, function(start, end, label) {
    console.log(start.toISOString(), end.toISOString(), label);
  });
  $('#single_cal3').daterangepicker({
    singleDatePicker: true,
    singleClasses: "picker_3"
  }, function(start, end, label) {
    console.log(start.toISOString(), end.toISOString(), label);
  });
  $('#single_cal4').daterangepicker({
    singleDatePicker: true,
    singleClasses: "picker_4"
  }, function(start, end, label) {
    console.log(start.toISOString(), end.toISOString(), label);
  });


}


function init_daterangepicker_reservation() {

  if (typeof($.fn.daterangepicker) === 'undefined') {
    return;
  }
  console.log('init_daterangepicker_reservation');

  $('#reservation').daterangepicker(null, function(start, end, label) {
    console.log(start.toISOString(), end.toISOString(), label);
  });

  $('#reservation-time').daterangepicker({
    timePicker: true,
    timePickerIncrement: 30,
    locale: {
      format: 'MM/DD/YYYY h:mm A'
    }
  });

}
//
// /* VALIDATOR */
//
// function init_validator() {
//
//   if (typeof(validator) === 'undefined') {
//     return;
//   }
//   console.log('init_validator');
//
//   // initialize the validator function
//   validator.message.date = 'not a real date';
//
//   // validate a field on "blur" event, a 'select' on 'change' event & a '.reuired' classed multifield on 'keyup':
//   $('form')
//     .on('blur', 'input[required], input.optional, select.required', validator.checkField)
//     .on('change', 'select.required', validator.checkField)
//     .on('keypress', 'input[required][pattern]', validator.keypress);
//
//   $('.multi.required').on('keyup blur', 'input', function() {
//     validator.checkField.apply($(this).siblings().last()[0]);
//   });
//
//   $('form').submit(function(e) {
//     e.preventDefault();
//     var submit = true;
//
//     // evaluate the form using generic validaing
//     if (!validator.checkAll($(this))) {
//       submit = false;
//     }
//
//     if (submit)
//       this.submit();
//
//     return false;
//   });
//
// };

/* COMPOSE */

function init_compose() {

  if (typeof($.fn.slideToggle) === 'undefined') {
    return;
  }
  console.log('init_compose');

  $('#compose, .compose-close').click(function() {
    $('.compose').slideToggle();
  });

};

/* DATA TABLES */

function init_DataTables() {

  console.log('run_datatables');

  if (typeof($.fn.DataTable) === 'undefined') {
    return;
  }
  console.log('init_DataTables');

  var handleDataTableButtons = function() {
    if ($("#datatable-buttons").length) {
      $("#datatable-buttons").DataTable({
        dom: "Blfrtip",
        buttons: [{
            extend: "copy",
            className: "btn-sm"
          },
          {
            extend: "csv",
            className: "btn-sm"
          },
          {
            extend: "excel",
            className: "btn-sm"
          },
          {
            extend: "pdfHtml5",
            className: "btn-sm"
          },
          {
            extend: "print",
            className: "btn-sm"
          },
        ],
        responsive: true
      });
    }
  };

  TableManageButtons = function() {
    "use strict";
    return {
      init: function() {
        handleDataTableButtons();
      }
    };
  }();

  $('#datatable').dataTable();

  $('#datatable-keytable').DataTable({
    keys: true
  });

  $('#datatable-responsive').DataTable();

  $('#datatable-scroller').DataTable({
    ajax: "js/datatables/json/scroller-demo.json",
    deferRender: true,
    scrollY: 380,
    scrollCollapse: true,
    scroller: true
  });

  $('#datatable-fixed-header').DataTable({
    fixedHeader: true
  });

  var $datatable = $('#datatable-checkbox');

  $datatable.dataTable({
    'order': [
      [1, 'asc']
    ],
    'columnDefs': [{
      orderable: false,
      targets: [0]
    }]
  });
  $datatable.on('draw.dt', function() {
    $('checkbox input').iCheck({
      checkboxClass: 'icheckbox_flat-green'
    });
  });

  TableManageButtons.init();

};

function archiveFunction() {
event.preventDefault(); // prevent form submit
var form = event.target.form; // storing the form
        swal({
  title: "Are you sure?",
  text: "But you will still be able to retrieve this file.",
  type: "warning",
  showCancelButton: true,
  confirmButtonColor: "#DD6B55",
  confirmButtonText: "Yes, archive it!",
  cancelButtonText: "No, cancel please!",
  closeOnConfirm: false,
  closeOnCancel: false
},
function(isConfirm){
  if (isConfirm) {
    a.hapus();          // submitting the form when user press yes
  } else {
    swal("Cancelled", "Your imaginary file is safe :)", "error");
  }
});
}


$(document).ready(function() {

  init_sidebar();
  init_parsley();
  init_daterangepicker();
  init_daterangepicker_right();
  init_daterangepicker_single_call();
  init_daterangepicker_reservation();
  init_select2();
  init_DataTables();
  init_calendar();
  init_compose();
  init_CustomNotification();
  init_autosize();
  // init_validator()

  AmCharts.loadJSON = function(url) {
    // create the request
    if (window.XMLHttpRequest) {
      // IE7+, Firefox, Chrome, Opera, Safari
      var request = new XMLHttpRequest();
    } else {
      // code for IE6, IE5
      var request = new ActiveXObject('Microsoft.XMLHTTP');
    }

    // load it
    // the last "false" parameter ensures that our code will wait before the
    // data is loaded
    request.open('GET', url, false);
    request.send();

    // parse and return the output
    return eval(request.responseText);
  };

});

var chart = AmCharts.makeChart("chartdiv", {
  "type": "pie",
  "angle": 29.7,
  "balloonText": "[[title]]<br><span style='font-size:14px'><b>[[value]]</b> ([[percents]]%)</span>",
  "depth3D": 21,
  "baseColor": "#E72222",
  "colors": [
    "#FF0F00",
    "#FF6600",
    "#FF9E01",
    "#FCD202",
    "#F8FF01",
    "#B0DE09",
    "#04D215",
    "#0D8ECF",
    "#0D52D1",
    "#2A0CD0",
    "#8A0CCF",
    "#CD0D74",
    "#754DEB",
    "#DDDDDD",
    "#999999",
    "#333333",
    "#000000",
    "#57032A",
    "#CA9726",
    "#990000",
    "#4B0C25"
  ],
  "gradientRatio": [],
  "maxLabelWidth": 198,
  "titleField": "category",
  "valueField": "column-1",
  "visibleInLegendField": "category",
  "theme": "default",
  "allLabels": [],
  "balloon": {},
  "titles": [],
  "dataProvider": [{
      "category": "★",
      "column-1": "8"
    },
    {
      "category": "★★",
      "column-1": "90"
    },
    {
      "category": "★★★",
      "column-1": "6"
    },
    {
      "category": "★★★★",
      "column-1": "8"
    },
    {
      "category": "★★★★★",
      "column-1": "66"
    }
  ]


});


$('#openBtn').click(function() {
  $('#myModal').modal({
    show: true
  })
});

function fileSelect(evt) {
  var files = evt.target.files;

  var result = '';
  var file;
  for (var i = 0; file = files[i]; i++) {
    result += '<li>' + file.name + ' ' + file.size + ' bytes</li>';
  }
  document.getElementById('filesInfo').innerHTML = '<ul>' + result + '</ul>';
}

document.getElementById('filesToUpload').addEventListener('change', fileSelect, false);


// $(document).ready(function() {
//     var max_fields      = 10; //maximum input boxes allowed
//     var wrapper         = $(".input_fields_wrap"); //Fields wrapper
//     var add_button      = $(".add_field_button"); //Add button ID
//
//     var x = 1; //initlal text box count
//     $(add_button).click(function(e){ //on add input button click
//         e.preventDefault();
//         if(x < max_fields){ //max input box allowed
//             x++; //text box increment
//             $(wrapper).append('<div="col-md-8"><input class="form-control" name="faktor[]" type="text" value="Teknisi"/><a href="#" class="remove_field">Remove</a></div>'); //add input box
//         }
//     });
//
//     $(wrapper).on("click",".remove_field", function(e){ //user click on remove text
//         e.preventDefault(); $(this).parent('div').remove(); x--;
//     })
// });


  function kirimFunction() {
  event.preventDefault(); // prevent form submit
  var form = event.target.form; // storing the form
          swal({
    title: "Kirim?",
    text: "But you will still be able to retrieve this file.",
    type: "warning",
    showCancelButton: true,
    confirmButtonColor: "#DD6B55",
    confirmButtonText: "Yes, archive it!",
    cancelButtonText: "No, cancel please!",
    closeOnConfirm: false,
    closeOnCancel: false
  },
  function(isConfirm){
    if (isConfirm) {
      swal("Terkirim!","","success")
      // submitting the form when user press yes
    } else {
      swal("Cancelled", "Your imaginary file is safe :)", "error");
    }
  });
  }
