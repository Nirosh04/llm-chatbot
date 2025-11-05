/*


cd "C:\Users\...\llm_chatbot\python"
flutter run
1
 



TO-DO:




const me_chat_color = Color.fromARGB(255, 40, 100, 160);     // deep azure for your messages
const llm_chat_color = Color.fromARGB(255, 30, 45, 70);      // dark navy bubble
const background_color = Color.fromARGB(255, 15, 20, 30);    // near-black background
const bar_header_color = Color.fromARGB(255, 148, 158, 173);    // darker header
const bar_color = Color.fromARGB(255, 25, 35, 50);
const text_color = Color.fromARGB(255, 220, 235, 255);       // soft off-white text
const fab_color = Color.fromARGB(255, 80, 150, 250);         // bright azure accent

*/


import 'package:flutter/material.dart';
import 'dart:math';
import 'backend/python_backend.dart' as python_backend;
import 'frontend/atoms.dart' as atoms; // meant for colors and buttons





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
  List<Widget> chatList = List.generate(20, (index) {
    bool isMe = index % 2 == 0;
    return turnStringToChatBubble(getRandomText(), isMe);
  });

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
                title: const Text('Test Dummy Server'),
                onTap: () {},//python_backend.getSignalCheck();},
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
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: chatList
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
                    child: TextField(
                      style: const TextStyle(color: atoms.textColor),
                      cursorColor: atoms.fabColor,
                      decoration: InputDecoration(
                        hintText: "Type a message...",
                        hintStyle: TextStyle(color: atoms.textColor.withOpacity(0.6)),
                        filled: true,
                        fillColor: atoms.backgroundColor,
                        contentPadding: const EdgeInsets.symmetric(
                            horizontal: 12, vertical: 10),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(20),
                          borderSide: BorderSide.none,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  // Send button
                  IconButton(
                    onPressed: () {
                      setState(() {
                        chatList.add(
                          turnStringToChatBubble('message controller not installed yet - but adding chatbubble works', true)
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