/*


*/

import 'package:flutter/material.dart';
import 'dart:convert';
import 'dart:typed_data';
import 'package:http/http.dart' as http;
import 'dart:io';
import 'dart:async';



Future<void> getSignalCheck() async {
  final url = Uri.parse('http://127.0.0.1:5000/check_signal');
  try {
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'}, // Optional for this case
    );

    if (response.statusCode == 200) {
      final prediction = jsonDecode(response.body)['prediction'];
      print('Prediction: $prediction');
    } else {
      print('Error: ${response.body}');
    }
  } catch (e) {
    print('Connection error: $e');
  }
}






Future<Uint8List> fileToBytes(File imageFile) async {
  // Resolve the image directly into a `ui.Image`
  Uint8List imageBytes = await imageFile.readAsBytes(); // Read image as bytes

  return imageBytes;
}


/*

process image with server by given option

 ██████  ██████  ████████ ██  ██████  ███    ██ ███████ 
██    ██ ██   ██    ██    ██ ██    ██ ████   ██ ██      
██    ██ ██████     ██    ██ ██    ██ ██ ██  ██ ███████ 
██    ██ ██         ██    ██ ██    ██ ██  ██ ██      ██ 
 ██████  ██         ██    ██  ██████  ██   ████ ███████ 
                                                        
                                                        
                                                                                                   

*/



Future<Uint8List> sendBytesToServer(Uint8List imageBytes, Uri url) async {
  try {
    final response = await http
        .post(
          url,
          headers: {'Content-Type': 'application/octet-stream'},
          body: imageBytes,
        )
        .timeout(const Duration(seconds: 20)); // Timeout protection

    if (response.statusCode == 200) {
      return response.bodyBytes;
    } else {
      throw Exception('Failed to process image: ${response.body}');
    }
  } on TimeoutException catch (_) {
    throw Exception('Request timed out after 20 seconds');
  } catch (e) {
    throw Exception('Error sending image: $e');
  }
}






// Main function to process the image with the server model
Future<Uint8List> processImageWithServerModel(File imageFile, String option) async {
  // Convert the file to bytes
  Uint8List imageBytes = await fileToBytes(imageFile);

  // Define the server URL
  late Uri url;
  if (option == "getModelOutput") {
    url = Uri.parse('http://127.0.0.1:5000/get-model-output');
  } else {
    throw ArgumentError('Invalid option "$option".');
  }

  try {
    // Send the image bytes to the server and get processed bytes
    Uint8List processedImageBytes = await sendBytesToServer(imageBytes, url);
    return processedImageBytes;
  } catch (e) {
    debugPrint('Exception in processImageWithServerModel: $e');
    rethrow;
  }
}


/*


██ ███    ███  ██████      ██████  ██ ███████ ███████ ███████ ██████  ███████ ███    ██  ██████ ███████ 
██ ████  ████ ██           ██   ██ ██ ██      ██      ██      ██   ██ ██      ████   ██ ██      ██      
██ ██ ████ ██ ██   ███     ██   ██ ██ █████   █████   █████   ██████  █████   ██ ██  ██ ██      █████   
██ ██  ██  ██ ██    ██     ██   ██ ██ ██      ██      ██      ██   ██ ██      ██  ██ ██ ██      ██      
██ ██      ██  ██████      ██████  ██ ██      ██      ███████ ██   ██ ███████ ██   ████  ██████ ███████ 
                                                                                                        
                                                                                                        

*/

Future<Uint8List> getPixelDifferenceImage(Uint8List originalImageBytes, Uint8List reconstructedImageBytes) async {
  try {
    Uri url = Uri.parse('http://127.0.0.1:5000/get-pixel-difference-image');

    // Create form-data payload
    var request = http.MultipartRequest('POST', url)
      ..files.add(http.MultipartFile.fromBytes(
        'image1',
        originalImageBytes,
        filename: 'original.png',
      ))
      ..files.add(http.MultipartFile.fromBytes(
        'image2',
        reconstructedImageBytes,
        filename: 'reconstructed.png',
      ));

    // Send the multipart request and process the response
    var response = await request.send();

    if (response.statusCode == 200) {
      // Extract the image bytes from the response stream
      return await response.stream.toBytes();
    } else {
      throw Exception(
          'Failed to get pixel difference image: ${response.reasonPhrase}');
    }
  } catch (e) {
    debugPrint('Exception in getPixelDifferenceImage: $e');
    rethrow;
  }
}


/*

██████   ██████  ██    ██ ███    ██ ██████  ██ ███    ██  ██████      ██████   ██████  ██   ██ 
██   ██ ██    ██ ██    ██ ████   ██ ██   ██ ██ ████   ██ ██           ██   ██ ██    ██  ██ ██  
██████  ██    ██ ██    ██ ██ ██  ██ ██   ██ ██ ██ ██  ██ ██   ███     ██████  ██    ██   ███   
██   ██ ██    ██ ██    ██ ██  ██ ██ ██   ██ ██ ██  ██ ██ ██    ██     ██   ██ ██    ██  ██ ██  
██████   ██████   ██████  ██   ████ ██████  ██ ██   ████  ██████      ██████   ██████  ██   ██ 
                                                                                               
                                                                                               

*/





// Main function to process the image with the server model
Future<Map<String, dynamic>> getBoundingBoxJsonFromServer(File imageFile) async {
  try {
    // Convert the file to bytes
    Uint8List imageBytes = await fileToBytes(imageFile);

    // Define the server URL for anomaly detection
    Uri url = Uri.parse('http://127.0.0.1:5000/get-anomaly-bounding-boxes');

    // Make the POST request
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/octet-stream'},
      body: imageBytes, // Send raw image bytes
    );

    // Log the raw response body for debugging
    //print('Raw response body: ${response.body}');

    // Check the server's response
    if (response.statusCode == 200) {
      // Parse the JSON response
      final jsonResponse = jsonDecode(response.body);

      // Extract bounding boxes
      List<dynamic> boundingBoxes = jsonResponse['bounding_boxes'];

      // Extract and decode the base64 image data
      String differenceImageBase64 = jsonResponse['difference_image'];
      String outputImageBase64 = jsonResponse['output_image'];
      String inputImageMarkedBase64 = jsonResponse['input_image_marked'];
      String outputImageMarkedBase64 = jsonResponse['output_image_marked'];
      String differenceImageMarkedBase64 = jsonResponse['difference_image_marked'];

      // Decode the base64 strings into Uint8List
      Uint8List differenceImage = base64Decode(differenceImageBase64);
      Uint8List outputImage = base64Decode(outputImageBase64);
      Uint8List inputImageMarked = base64Decode(inputImageMarkedBase64);
      Uint8List outputImageMarked = base64Decode(outputImageMarkedBase64);
      Uint8List differenceImageMarked = base64Decode(differenceImageMarkedBase64);

      // Return both bounding boxes and images as a map
      return {
        'bounding_boxes': boundingBoxes,
        'images': {
          'difference_image': differenceImage,
          'output_image': outputImage,
          'input_image_marked': inputImageMarked,
          'output_image_marked': outputImageMarked,
          'difference_image_marked': differenceImageMarked
        }
      };
    } else {
      throw Exception('Failed to fetch bounding boxes and images. Status code: ${response.statusCode}');
    }
  } catch (e) {
    print('Error in getBoundingBoxJsonFromServer: $e');
    rethrow;
  }
}


Future<Uint8List> getProcessedImageWithBoundingBoxes(
      String imagePath, List<Map<String, double>> boundingBoxes) async {
    final url = Uri.parse('http://127.0.0.1:5000/draw_boxes'); // Update URL if needed
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'image_path': imagePath,
        'bounding_boxes': boundingBoxes,
      }),
    );

    if (response.statusCode == 200) {
      return response.bodyBytes;
    } else {
      throw Exception('Failed to process image: ${response.body}');
    }
}


Future<Map<String, Uint8List>> sendLatentTraceRequest(
  Uint8List inputImageBytes, List<Map<String, dynamic>> boundingBoxes) async {
    final uri = Uri.parse('http://127.0.0.1:5000/get-latenttrace-equivalent');
    final requestBody = json.encode({
      "image": base64Encode(inputImageBytes),
      "bounding_boxes": boundingBoxes,
    });

    final response = await http.post(
      uri,
      headers: {"Content-Type": "application/json"},
      body: requestBody,
    );

    if (response.statusCode == 200) {
      // Parse and decode the response body
      final responseData = json.decode(response.body);
      return {
        "similar_training_image": base64Decode(responseData["similar_training_image"]),
        "manipulated_image": base64Decode(responseData["manipulated_image"]),
        "difference_image": base64Decode(responseData["difference_image"]),
      };
    } else {
      throw Exception("Failed to fetch latent trace equivalent: ${response.body}");
    }
}

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


/*


XFile? image = await imagePicker.pickImage(
     source: ImageSource.gallery,
); // Upload file from gallery

//final bytes = await image!.readAsBytes(); // Converts the file to UInt8List




processImageWithServerModel(


function that takes image

for now work with:
Image exampleImage = Image.asset(
    'assets/example.png',
  );




*/


