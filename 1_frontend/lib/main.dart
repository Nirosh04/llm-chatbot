/*


cd "C:\Users\...\llm_chatbot\python"
flutter run
1
 



*/


import 'package:flutter/material.dart';
import 'dart:math';
import 'server_backend/http_backend.dart' as python_backend;
import 'frontend/atoms.dart' as atoms; // meant for colors and buttons
import 'dart:developer' as dev;





void main() {
  runApp(MyApp());
}




const sampleTexts = [
      "Helo",
      "This is a chat bubble.",
      "Hello patient! How can I help?",
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
      "Hello patient! How can I help?",
      "Hello patient! How can I help?",
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
      "Hello patient! How can I help?",
    ];


Widget turnStringToChatBubble(String message, bool isMe) {
  return Padding(
    padding: EdgeInsets.only(
      left: isMe ? 110.0 : 10.0,
      right: isMe ? 10.0 : 110.0,
    ),
    child: Align(
      alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 6),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: isMe ? atoms.meChatColor : atoms.llmChatColor,
          borderRadius: BorderRadius.circular(15),
        ),
        child: Text(
          message,
          style: const TextStyle(
            fontSize: 16,
            color: atoms.textColor,
          ),
        ),
      ),
    ),
  );
}




class HomeGreeting extends StatelessWidget {
  const HomeGreeting({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    // Get the full height of the screen
    final height = MediaQuery.of(context).size.height;

    return SizedBox(
      height: height, // take full screen height
      width: double.infinity,
      child: const Center( // center the child vertically and horizontally
        child: Padding(
          padding: EdgeInsets.symmetric(horizontal: 32),
          child: Column(
            mainAxisSize: MainAxisSize.min, // only take as much height as needed
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Icon(Icons.auto_awesome, size: 48, color: atoms.fabColor),
              SizedBox(height: 24),
              Text(
                'Willkommen!',
                style: TextStyle(
                  fontSize: 36,
                  fontWeight: FontWeight.w600,
                  color: atoms.textColor,
                ),
              ),
              SizedBox(height: 16),
              Text(
                'Ich bin Ihr digitaler Begleiter für die Wartezeit.',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 26,
                  fontWeight: FontWeight.w600,
                  color: atoms.textColor,
                ),
              ),
              SizedBox(height: 12),
              Text(
                'Wie geht es Ihnen? Tippen Sie einfach los, ich höre Ihnen zu',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 24,
                  color: atoms.textColor,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}



class CustomTextField extends StatelessWidget {
  final TextEditingController? controller;
  final ValueChanged<String>? onChanged;
  final String hintText;
  final Color textColor;
  final Color cursorColor;
  final Color backgroundColor;

  const CustomTextField({
    super.key,
    this.controller,
    this.onChanged,
    this.hintText = "Type a message...",
    required this.textColor,
    required this.cursorColor,
    required this.backgroundColor,
  });

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      onChanged: onChanged, // not needed for our application anyway
      style: TextStyle(color: textColor),
      cursorColor: cursorColor,
      decoration: InputDecoration(
        hintText: hintText,
        hintStyle: TextStyle(color: textColor.withOpacity(0.6)),
        filled: true,
        fillColor: backgroundColor,
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(20),
          borderSide: BorderSide.none,
        ),
      ),
    );
  }
}



// Generate random dummy text
String getRandomText() {
  
  return sampleTexts[Random().nextInt(sampleTexts.length)];
}





class MyApp extends StatefulWidget {
  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  // Move your chatList and other variables here
  final TextEditingController _messageController = TextEditingController();

  List<Widget> chatList = [];

  bool sessionIdCreated = false;
  String? sessionId; // Declare variable outside


  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: true,
      home: Scaffold(
        backgroundColor: atoms.backgroundColor,
        // Sidebar / Drawer
        drawer: Drawer(
          child: ListView(
            padding: EdgeInsets.zero,
            children: [
              const DrawerHeader(
                decoration: BoxDecoration(
                  color: atoms.barHeaderColor,
                ),
                child: Text(
                  'Sidebar Menu',
                  style: TextStyle(
                    color: atoms.textColor,
                    fontSize: 24,
                  ),
                ),
              ),
              ListTile(
                leading: const Icon(Icons.home),
                title: const Text('Test - Signal check'),
                onTap: () {python_backend.getSignalCheck();},
                //onTap: () {}, // this line is in case one wants to disable the http side temporarily
              ),
              ListTile(
                leading: const Icon(Icons.home),
                title: const Text('Test - Create session'),
                onTap: () async {
                  final sessionId = await python_backend.createSession();
                  print('Session created: $sessionId');
                },
                //onTap: () {}, // this line is in case one wants to disable the http side temporarily
              ),
              ListTile(
                leading: const Icon(Icons.home),
                title: const Text('Test LLM response'),
                onTap: () async {

                  if (!sessionIdCreated) {
                    sessionId = await python_backend.createSession();
                    sessionIdCreated = true;
                  }

                  final response = await python_backend.getLLMResponseFromServer(
                    sessionId,
                    'Hello model. Help. My back aches.'
                  );
                  
                  // Now you can access the map data
                  print('LLM Response: ${response['ai_response']}');
                  
                  // Or, for example, show it in a dialog/snackbar:
                  // if (!mounted) return; // Widget might have been removed
                  setState(() {
                    chatList.add(
                      turnStringToChatBubble(response['ai_response'], false)
                    );
                  });
                },
              ),
              ListTile(
                leading: const Icon(Icons.home),
                title: const Text('Test health summary'),
                onTap: () async {

                  if (!sessionIdCreated) {
                    sessionId = await python_backend.createSession();
                    sessionIdCreated = true;
                  }

                  final response = await python_backend.getHealthSummary(
                    sessionId,
                  );
                  
                  // Now you can access the map data
                  print('LLM Response: ${response['ai_summary']?.substring(0, 14)}');
                  
                  // Or, for example, show it in a dialog/snackbar:
                  // if (!mounted) return; // Widget might have been removed
                  setState(() {
                    chatList.add(
                      turnStringToChatBubble(response['ai_summary'], false)
                    );
                  });
                },
              ),
              ListTile(
                leading: const Icon(Icons.home),
                title: const Text('Test Reset conversation'),
                onTap: () async {

                  if (!sessionIdCreated) {
                    sessionId = await python_backend.createSession();
                    sessionIdCreated = true;
                  }

                  await python_backend.resetConversation(
                    sessionId,
                  );
                  
                  // Now you can access the map data
                  print('Conversation resetted');
                  
                  // Or, for example, show it in a dialog/snackbar:
                  // if (!mounted) return; // Widget might have been removed
                  setState(() {
                    chatList.clear();
                  });
                },
              ),
              ListTile(
                leading: const Icon(Icons.person),
                title: const Text('Profile'),
                onTap: () {},
              ),
              ListTile(
                leading: const Icon(Icons.settings),
                title: const Text('Settings'),
                onTap: () {},
              ),
              ListTile(
                leading: const Icon(Icons.logout),
                title: const Text('Logout'),
                onTap: () {},
              ),
            ],
          ),
        ),
        // AppBar with slightly different color
        appBar: AppBar(
          backgroundColor: atoms.backgroundColor, // slightly different
          title: const Center(
            child: Text("Chat UI Example"),
          ),
        ),
        body: Column(
          children: [
            // Expanded chat area (scrollable)
            Expanded(
              child: SingleChildScrollView(
                reverse: true, // so newest messages appear at the bottom
                child: Column(
                  children: chatList.isEmpty 
                    ? [const HomeGreeting()] // show HomeGreeting if chatList is empty
                    : chatList,        // otherwise show the chat messages
                ),
              ),
            ),
            // Bottom input bar
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 10),
              color: atoms.barColor,
              child: Row(
                children: [
                  // Text field expands to fill available space
                  Expanded(
                    child: CustomTextField(
                      controller: _messageController,
                      textColor: atoms.textColor,
                      cursorColor: atoms.fabColor,
                      backgroundColor: atoms.backgroundColor,
                    ),

                  ),
                  const SizedBox(width: 8),
                  // Send button
                  IconButton(
                    onPressed: () async {
                      final messageText = _messageController.text.trim();
                      setState(() {
                        chatList.add(
                          turnStringToChatBubble(messageText, true)
                        );
                      });
                      _messageController.clear(); // Clear input after sending

                      if (!sessionIdCreated) {
                        sessionId = await python_backend.createSession();
                        sessionIdCreated = true;
                      }

                      final response = await python_backend.getLLMResponseFromServer(
                        sessionId,
                        messageText
                      );
                      
                      // Now you can access the map data
                      print('LLM Response: ${response['ai_response']}');
                      
                      // Or, for example, show it in a dialog/snackbar:
                      // if (!mounted) return; // Widget might have been removed
                      setState(() {
                        chatList.add(
                          turnStringToChatBubble(response['ai_response'], false)
                        );
                      });

                    },
                    icon: const Icon(Icons.send, color: atoms.iconColor),
                    style: IconButton.styleFrom(
                      backgroundColor: atoms.fabColor,
                      shape: const StadiumBorder(), // Perfect middle ground
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}