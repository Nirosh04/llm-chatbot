
import 'dart:convert';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:path_provider/path_provider.dart';  
import 'frontend/atoms.dart' as atoms;

class SymptomsPage extends StatefulWidget {
  const SymptomsPage({super.key});

  @override
  State<SymptomsPage> createState() => _SymptomsPageState();
}

class _SymptomsPageState extends State<SymptomsPage> {
  static const _fileName = "symptoms_data.json";
  static const Map<String, dynamic> _defaultData = {
    "historyOfPresentIllness": {
      "keySymptoms": [
        {
          "description": "Kopfschmerzen",
          "location": "Stirn",
          "severity": "mittel",
          "duration": "seit 2 Tagen",
          "pain": 6
        },
        {
          "description": "Müdigkeit",
          "location": "gesamt",
          "severity": "leicht",
          "duration": "seit 1 Woche",
          "pain": 3
        }
      ]
    }
  };

  Map<String, dynamic>? _jsonData;
  late File _localFile;
  bool _isLoading = true;

  int _normalizePain(Map<String, dynamic> symptom) {
    final painValue = symptom["pain"];
    if (painValue is num) {
      final normalized = painValue.clamp(1, 10).toInt();
      symptom["pain"] = normalized;
      return normalized;
    }
    symptom["pain"] = 5;
    return 5;
  }

  @override
  void initState() {
    super.initState();
    _initData();
  }

  Future<void> _initData() async {
    final dir = await getApplicationDocumentsDirectory();
    _localFile = File("${dir.path}/$_fileName");

    if (!await _localFile.exists()) {
      await _localFile.writeAsString(jsonEncode(_defaultData));
    }

    try {
      final fileString = await _localFile.readAsString();
      setState(() {
        _jsonData = jsonDecode(fileString);
        _isLoading = false;
      });
    } catch (_) {
      // reset to default when the file is corrupted
      await _localFile.writeAsString(jsonEncode(_defaultData));
      setState(() {
        _jsonData = jsonDecode(jsonEncode(_defaultData));
        _isLoading = false;
      });
    }
  }

  Future<void> _saveData() async {
    if (_jsonData == null) return;
    await _localFile.writeAsString(jsonEncode(_jsonData));
  }

  List<dynamic> _symptomsList() {
    _jsonData ??= jsonDecode(jsonEncode(_defaultData));
    var history =
        _jsonData?["historyOfPresentIllness"] as Map<String, dynamic>?;
    history ??= {};
    _jsonData!["historyOfPresentIllness"] = history;

    final existing = history["keySymptoms"];
    if (existing is List<dynamic>) return existing;

    final fresh = <dynamic>[];
    history["keySymptoms"] = fresh;
    return fresh;
  }

  void _addSymptom(
    String description,
    String duration,
    int pain,
    String location,
  ) {
    if (_jsonData == null) return;

    final newSymptom = {
      "description":
          description.isEmpty ? "Neues Symptom" : description.trim(),
      "location": location.isEmpty ? "unbekannt" : location.trim(),
      "severity": "$pain/10", // kept for compatibility; tied to pain scale
      "pain": pain.clamp(1, 10),
      "duration":
          duration.isEmpty ? "Keine Dauer angegeben" : duration.trim(),
    };

    setState(() {
      _symptomsList().add(newSymptom);
    });
    _saveData();
  }

  void _removeSymptom(int index) {
    if (_jsonData == null) return;
    setState(() {
      _symptomsList().removeAt(index);
    });
    _saveData();
  }

  void _showAddSymptomDialog() {
    final descriptionController = TextEditingController();
    final durationController = TextEditingController();
    final locationController = TextEditingController();
    double painLevel = 5;

    showDialog(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setStateDialog) {
            return AlertDialog(
              title: const Text("Neues Symptom Hinzufügen"),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  TextField(
                    controller: descriptionController,
                    decoration: const InputDecoration(labelText: "Beschreibung"),
                  ),
                  TextField(
                    controller: durationController,
                    decoration: const InputDecoration(labelText: "Dauer"),
                  ),
                  TextField(
                    controller: locationController,
                    decoration: const InputDecoration(labelText: "Ort"),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text("Schmerz (1-10)"),
                      Text(painLevel.toInt().toString()),
                    ],
                  ),
                  Slider(
                    value: painLevel,
                    min: 1,
                    max: 10,
                    divisions: 9,
                    label: painLevel.toStringAsFixed(0),
                    activeColor: atoms.fabColor,
                    inactiveColor: atoms.barColor, 
                    onChanged: (value) {
                      setStateDialog(() {
                        painLevel = value;
                      });
                    },
                  ),
                ],
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text("Abbrechen"),
                ),
                TextButton(
                  onPressed: () {
                    _addSymptom(
                      descriptionController.text,
                      durationController.text,
                      painLevel.round(),
                      locationController.text,
                    );
                    Navigator.pop(context);
                  },
                  child: const Text("Hinzufügen"),
                ),
              ],
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading || _jsonData == null) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    final symptoms = _symptomsList();

    return Scaffold(
      backgroundColor:atoms.backgroundColor,
      appBar: AppBar(
        elevation: 0,
        backgroundColor:atoms.backgroundColor,
        scrolledUnderElevation: 0,
        title: const Text(
          "Symptome",
          style: TextStyle(
            color:atoms.textColor,
            fontSize: 30,
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: symptoms.length,
              itemBuilder: (context, index) {
                final s = symptoms[index] as Map<String, dynamic>;
                final location = (s["location"] ?? "unbekannt").toString();
                final painValue = _normalizePain(s);

                return Container(
                  margin: const EdgeInsets.only(bottom: 16),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: atoms.llmChatColor,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: ExpansionTile(
                    tilePadding: EdgeInsets.zero,
                    title: Text(
                      s["description"] ?? "Kein Titel",
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w700,
                        color: Colors.black,
                      ),
                    ),
                    childrenPadding: const EdgeInsets.only(top: 8),
                    children: [
                      Text(
                        "Dauer: ${s["duration"] ?? "Keine Dauer angegeben"}",
                        style: const TextStyle(
                          fontSize: 16,
                          color: Colors.black87,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        "Ort: $location",
                        style: const TextStyle(
                          fontSize: 14,
                          color: Colors.black87,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            "Schmerz (1-10)",
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          Text(
                            painValue.toString(),
                            style: const TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                      Slider(
                        value: painValue.toDouble(),
                        min: 1,
                        max: 10,
                        divisions: 9,
                        label: painValue.toString(),
                        onChanged: (value) {
                          setState(() {
                            s["pain"] = value.round();
                          });
                          _saveData();
                        },
                      ),
                      Align(
                        alignment: Alignment.centerRight,
                        child: Tooltip(
                          message: "Symptom entfernen",
                          child: IconButton(
                            icon: const Icon(Icons.remove_circle_outline),
                            onPressed: () => _removeSymptom(index),
                          ),
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
          Padding(
            padding: const EdgeInsets.only(bottom: 24),
            child: Tooltip(
              message: "Neues Symptom Hinzufügen",
              child: GestureDetector(
                onTap: _showAddSymptomDialog,
                child: Container(
                  width: 60,
                  height: 60,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: Colors.white,
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.1),
                        blurRadius: 12,
                        spreadRadius: 1,
                        offset: const Offset(0, 4),
                      )
                    ],
                  ),
                  child: const Center(
                    child: Icon(
                      Icons.add,
                      size: 32,
                      color: Colors.black,
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}



