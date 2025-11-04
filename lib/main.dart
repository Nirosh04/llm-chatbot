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
import 'backend/python_backend.dart';
import 'dart:math';


const me_chat_color = Color.fromARGB(255, 180, 215, 255);   // soft azure bubble
const llm_chat_color = Color.fromARGB(255, 230, 240, 255);  // pale blue-white bubble
const background_color = Color.fromARGB(255, 245, 250, 255); // near-white with azure hint
const bar_header_color = Color.fromARGB(255, 220, 235, 255); // light azure header
const bar_color = Color.fromARGB(255, 220, 235, 255);
const text_color = Color.fromARGB(255, 25, 40, 70);          // deep navy text
const fab_color = Color.fromARGB(255, 100, 160, 255);        // bright azure accent
const icon_color = bar_color;

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
          color: isMe ? me_chat_color : llm_chat_color,
          borderRadius: BorderRadius.circular(15),
        ),
        child: Text(
          message,
          style: const TextStyle(
            fontSize: 16,
            color: text_color,
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
        backgroundColor: background_color,
        // Sidebar / Drawer
        drawer: Drawer(
          child: ListView(
            padding: EdgeInsets.zero,
            children: [
              const DrawerHeader(
                decoration: BoxDecoration(
                  color: bar_header_color,
                ),
                child: Text(
                  'Sidebar Menu',
                  style: TextStyle(
                    color: text_color,
                    fontSize: 24,
                  ),
                ),
              ),
              ListTile(
                leading: const Icon(Icons.home),
                title: const Text('Home'),
                onTap: () {},
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
          backgroundColor: background_color, // slightly different
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
              color: bar_color,
              child: Row(
                children: [
                  // Text field expands to fill available space
                  Expanded(
                    child: TextField(
                      style: const TextStyle(color: text_color),
                      cursorColor: fab_color,
                      decoration: InputDecoration(
                        hintText: "Type a message...",
                        hintStyle: TextStyle(color: text_color.withOpacity(0.6)),
                        filled: true,
                        fillColor: background_color,
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
                    icon: const Icon(Icons.send, color: icon_color),
                    style: IconButton.styleFrom(
                      backgroundColor: fab_color,
                      shape: const StadiumBorder(), // Perfect middle ground
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    ),
                  ),
                  IconButton(
                    onPressed: () {
                      getSignalCheck();
                    },
                    icon: const Icon(Icons.web, color: Color.fromARGB(255, 115, 167, 235)),
                  
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