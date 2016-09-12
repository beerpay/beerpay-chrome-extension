(function () {
  'use strict';

  // Assets
  var bpLogo = chrome.extension.getURL('images/beerpay-logo.svg');

  // Vars
  var baseUrl = 'https://beerpay.io';

  // Info
  var github = {};
  var project;

  // Helpers
  var _addImportWishBtn = function () {
    if (github.isProjectIssues) {
      $('.btn-beerpay-wish').remove();

      $('li.js-issue-row').each(function () {
        var $item = $(this);
        var issueIdRegex = $item.attr('id').match(/\d+/g);
        var issueId = issueIdRegex ? parseInt(issueIdRegex[0], 10) : 0;
        var btnHtml;

        var importedWish = project.imported_wishes.find(function (wish) {
          return wish.issue_number === issueId;
        });

        if (importedWish) {
          btnHtml = '<a href="' + baseUrl + '/' + github.ownerName + '/' + github.projectName + '/wishes/' + importedWish._id + '" target="_blank" title="View imported Wish on Beerpay" class="btn btn-sm btn-beerpay-wish-imported float-right mt-2 mr-3 mb-2"><small>Imported on Berepay</small></a>';
        } else {
          btnHtml = '<a href="' + baseUrl + '/' + github.ownerName + '/' + github.projectName + '?import=' + issueId + '" target="_blank" title="Import this issue as a Wish on Beerpay" class="btn btn-sm btn-beerpay-wish float-right mt-2 mr-3 mb-2"><small>Import as a Wish</small></a>';
        }

        var $btnContainer = $item.find('.col-2.float-right');
        $btnContainer.append(btnHtml);
      });
    }
  };

  var _addBeerpayBtn = function (isInBeerpay) {
    var totalAmount = project ? project.total_amount : 0;

    var btnUrl = isInBeerpay ? github.ownerName + '/' + github.projectName : 'invite?user=' + github.ownerName + '&repo=' + github.projectName;
    var btnHtml = '<li class="beerpay-button"><a href="' + baseUrl + '/' + btnUrl + '" class="btn btn-sm btn-with-count btn-beerpay" target="_blank"><img src="' + bpLogo + '" class="beerpay-logo"> Beerpay</a><span class="social-count">$' + totalAmount + '</span></li>';

    $('.beerpay-button').remove();
    $('.pagehead-actions').prepend(btnHtml);
  };

  var _isInBeerpay = function () {
    var url = baseUrl + '/api/v1/browser-extension/' + github.ownerName + '/' + github.projectName;

    $.getJSON(url)
      .done(function (data) {
        project = data;

        _addBeerpayBtn(true);
        _addImportWishBtn();
      })
      .fail(function (jqxhr, textStatus, error) {
        _addBeerpayBtn(false);
      });
  };

  var _getGitHubInfo = function () {
    var pathName = window.location.pathname.replace(/^\//, '');
    var pathSplit = pathName.split('/');
    var lastPart = pathSplit[pathSplit.length - 1];

    // GitHub data
    github.ownerName = pathSplit[0];
    github.projectName = pathSplit[1];
    github.isProjectHome = pathSplit.length === 2;
    github.isProjectIssues = pathSplit.length === 3 && lastPart === 'issues';
    github.isProjectPulls = pathSplit.length === 3 && lastPart === 'pulls';

    // Debug
    // console.log('github.com');
    // console.log('>> ownerName', github.ownerName);
    // console.log('>> projectName', github.projectName);
    // console.log('>> isProjectHome', github.isProjectHome);
    // console.log('>> isProjectIssues', github.isProjectIssues);
    // console.log('>> isProjectPulls', github.isProjectPulls);

    _isInBeerpay();
  };

  // Init
  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === 'change') {
      _getGitHubInfo();
    }
  });

})();
