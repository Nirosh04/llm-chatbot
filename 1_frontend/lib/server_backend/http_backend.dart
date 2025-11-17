/*


*/

import 'package:flutter/material.dart';
import 'dart:convert';
import 'dart:typed_data';
import 'package:http/http.dart' as http;
import 'dart:io';
import 'dart:async';
import 'dart:developer' as dev;




Future<void> getSignalCheck() async {
  final url = Uri.parse('http://127.0.0.1:5000/check_signal');
  try {
    
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'}, // Optional for this case
    );

    print('Server status: ${response.statusCode}');
    print('Server response body: "${response.body}"');


    if (response.statusCode == 200) {
      final prediction = jsonDecode(response.body)['prediction'];
      print('Signal check: $prediction (1=successful test)');
    } else {
      print('Error: ${response.body}');
    }
  } catch (e) {
    print('Connection error: $e');
  }
}




/*

process data with server by given option

 ██████  ██████  ████████ ██  ██████  ███    ██ ███████ 
██    ██ ██   ██    ██    ██ ██    ██ ████   ██ ██      
██    ██ ██████     ██    ██ ██    ██ ██ ██  ██ ███████ 
██    ██ ██         ██    ██ ██    ██ ██  ██ ██      ██ 
 ██████  ██         ██    ██  ██████  ██   ████ ███████                       
                                                                                                   

*/


Future<String> createSession() async {
  try {
    // Define the server URL for creating a new session
    Uri url = Uri.parse('http://127.0.0.1:5000/api/sessions');

    // Make the POST request
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
    );

    // Check the server's response
    if (response.statusCode == 200) {
      // Parse the JSON response
      final jsonResponse = jsonDecode(response.body);
      
      final sessionId = jsonResponse['session_id'] ?? '';
      print('Created new session: $sessionId');
      
      return sessionId;
    } else {
      throw Exception('Failed to create session. Status code: ${response.statusCode}');
    }
  } catch (e) {
    print('Error in createSession: $e');
    rethrow;
  }
}




Future<Map<String, dynamic>> getLLMResponseFromServer(dynamic sessionId, String userText) async {
  try {
  // Define the server URL for LLM/text response
  Uri url = Uri.parse('http://127.0.0.1:5000/api/sessions/${sessionId}/get-llm-response');

  // Make the POST request with JSON body
  final response = await http.post(
    url,
    headers: {'Content-Type': 'application/json'},
    body: jsonEncode({'content': userText}),
  );

  // Check the server's response
  if (response.statusCode == 200) {
    // Parse the JSON response
    final jsonResponse = jsonDecode(response.body);

    print('Server returned JSON keys: ${jsonResponse.keys.toList()}');
    print('Signal check for LLM answer: ""${jsonResponse['reply']}"" ');

    // Return JSONified response as input/output structure
    return {
      'ai_response': jsonResponse['reply'] ?? ''
    };
  } else {
    throw Exception('Failed to fetch LLM response. Status code: ${response.statusCode}');
  }
  
  } catch (e) {
  print('Error in getLLMResponseFromServer: $e');
  rethrow;
  }
}


/// this function is not used yet (there will probably only be one model anyway)
/// Fetch the list of available models from the backend.
Future<List<String>> fetchModels() async {
  final uri = Uri.parse('http://127.0.0.1:5000/list-models');
  try {
    final response = await http.get(uri);
    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      return List<String>.from(data['models']);
    } else {
      throw Exception('Failed to fetch models: ${response.body}');
    }
  } catch (e) {
    throw Exception('Error fetching models: $e');
  }
}



/// this function is not used yet (there will probably only be one model anyway)
/// Set the selected model on the backend.
Future<void> setModel(String modelName) async {
  final uri = Uri.parse('http://127.0.0.1:5000/set-model');
  try {
    final response = await http.post(
      uri,
      headers: {"Content-Type": "application/json"},
      body: json.encode({"model_name": modelName}),
    );
    if (response.statusCode != 200) {
      throw Exception('Failed to set model: ${response.body}');
    }
  } catch (e) {
    throw Exception('Error setting model: $e');
  }
}


