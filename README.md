reply-to-all-as-cc
==================

Send a reply for recipients as Cc except the sender, when you do "Reply to All".

When there is no Cc, Thunderbird automatically send a reply to other recipients as Cc. For example:

 * Original message
   - Author: from@example.com (the sender)
   - To: me@example.com (it's me)
   - To: to@example.com
 * A reply generated by "Reply to All" command
   - To: from@example.com
   - Cc: to@example.com <= changed from To to Cc

However, if there is any Cc, Thunderbird sends a reply to other To recipients as To, and Cc recipients as Cc. For example:

 * Original message
   - Author: from@example.com (the sender)
   - To: me@example.com (it's me)
   - To: to@example.com
   - Cc: cc@example.com
 * A reply generated by "Reply to All" command
   - To: from@example.com
   - To: to@example.com <= not changed
   - Cc: cc@example.com

Do you want all other recipients to be Cc always? Then, this addon does it. With this addon, even if there is any Cc, Thunderbird always send a reply for all recipients as Cc except the sender, like:

 * Original message
   - Author: from@example.com (the sender)
   - To: me@example.com (it's me)
   - To: to@example.com
   - Cc: cc@example.com
 * A reply generated by "Reply to All" command
   - To: from@example.com
   - Cc: to@example.com <= changed from To to Cc
   - Cc: cc@example.com
