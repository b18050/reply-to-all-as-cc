/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var ReplyToAllAsCc = {
  log: function() {
    if (!Services.prefs.getBoolPref('extensions.reply-to-all-as-cc@clear-code.com.debug'))
      return;
    console.log.apply(console, arguments);
  },

  isReplyAll: function() {
    return gMsgCompose.type == Components.interfaces.nsIMsgCompType.ReplyAll;
  },

  isSentMail: function() {
    var originalMailFolder = gMsgCompose.originalMsgURI.split('#')[0].replace(/^(\w+)-message:/, '$1:');
    return originalMailFolder == gMsgCompose.identity.fccFolder;
  },

  getOriginalSender: function() {
    this.log('getOriginalSender for ', gMsgCompose.originalMsgURI);
    var originalHdr = this.getMsgHdrFromURI(gMsgCompose.originalMsgURI);
    this.log('  originalHdr: ', originalHdr);
    var sender = this.extractAddresses(originalHdr.mime2DecodedAuthor);
    this.log('  originalHdr.mime2DecodedAuthor: ', originalHdr.mime2DecodedAuthor);
    return sender.length > 0 ? sender[0] : null ;
  },

  getMsgHdrFromURI: function(aURI) {
    return Components.classes['@mozilla.org/messenger;1']
             .getService(Components.interfaces.nsIMessenger)
             .msgHdrFromURI(aURI);
  },

  extractAddresses: function(aAddressesWithComments) {
    this.log('extractAddresses for ', aAddressesWithComments);
    var parser = Components.classes['@mozilla.org/messenger/headerparser;1']
                   .getService(Components.interfaces.nsIMsgHeaderParser);
    var addresses = {};
    var names = {};
    var fullNames = {};
    var count = {};
    parser.parseHeadersWithArray(aAddressesWithComments, addresses, names, fullNames, count);
    this.log('  => ', addresses.value);
    return addresses.value.filter(value => value.trim() != '');
  },

  get addressingWidget() {
    return document.getElementById('addressingWidget');
  },

  get awRecipientItems() {
    var menulists = this.addressingWidget.querySelectorAll('.addressingWidgetItem');
    return Array.slice(menulists, 0);
  },

  getRecipientTypeChooser: function(aItem) {
    return aItem.querySelector('menulist');
  },
  getRecipientValue: function(aItem) {
    return aItem.querySelector('textbox').value;
  },

  init: function() {
    if (!this.isReplyAll() ||
        (Services.prefs.getBoolPref('extensions.reply-to-all-as-cc@clear-code.com.exceptSentFolder') &&
         this.isSentMail()))
      return;

    var sender = this.getOriginalSender();

    var allRecipients = this.awRecipientItems.map(function(aItem) {
      var chooser = this.getRecipientTypeChooser(aItem);
      var recipient = this.getRecipientValue(aItem);
      var addresses = this.extractAddresses(recipient);
      return {
        chooser:   chooser,
        addresses: addresses,
        isSender:  addresses.includes(sender)
      };
    }, this);

    if (allRecipients.some(function(aRecipient) {
          return aRecipient.isSender;
        })) {
      this.log('Sender is found in recipients: set only sender as "To" and set others as "Cc"');
      allRecipients.forEach(function(aRecipient) {
        if (aRecipient.chooser.value == 'addr_to' && !aRecipient.isSender)
          aRecipient.chooser.value = 'addr_cc';
      });
    }
    else {
      this.log('Sender is not found in recipients: sent by myself, so do nothing.');
    }
  },

  handleEvent: function(aEvent) {
    switch (aEvent.type) {
      case 'compose-window-init':
        document.documentElement.addEventListener('compose-window-close', this, false);
        window.addEventListener('unload', this, false);
        gMsgCompose.RegisterStateListener(this);
        return;

      case 'compose-window-close':
        gMsgCompose.UnregisterStateListener(this);
        return;

      case 'unload':
        document.documentElement.removeEventListener('compose-window-init', this, false);
        document.documentElement.removeEventListener('compose-window-close', this, false);
        window.removeEventListener('unload', this, false);
        return;
    }
  },

  // nsIMsgComposeStateListener
  NotifyComposeFieldsReady: function() {
    // do it after all fields are constructed completely.
    setTimeout(this.init.bind(this), 0);
  },
  NotifyComposeBodyReady: function() {},
  ComposeProcessDone: function() {},
  SaveInFolderDone: function() {}
};

document.documentElement.addEventListener('compose-window-init', ReplyToAllAsCc, false);
