import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { WebView } from 'react-native-webview';

const AnswerGeneratorWebView = () => {
  const backendBaseUrl = 'http://192.168.0.178:8000';

  const injectedHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>AI Answer Generator</title>
      <style>
        body { font-family: sans-serif; padding: 20px; }
        pre { background: #f4f4f4; padding: 10px; white-space: pre-wrap; word-wrap: break-word; }
        button { padding: 10px 15px; margin-bottom: 20px; background: green; color: white; border: none; border-radius: 5px; }
        .question-block { border: 1px solid #ddd; padding: 10px; margin-bottom: 15px; border-radius: 5px; }
      </style>
    </head>
    <body>
      <h1>Answer Generator</h1>
      <button onclick="generateAnswers()">Start Generating</button>
      <p id="status">Idle...</p>
      <div id="results"></div>

      <script>
        window.puter = {
          ai: {
            chat: async function(prompt, options) {
              const res = await fetch('https://api.puter.com/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: prompt, model: options.model || "gpt-4.1-nano" })
              });
              const data = await res.json();
              return data.response || "No response";
            }
          }
        };
      </script>

      <script>
        async function generateAnswers() {
          const status = document.getElementById("status");
          const results = document.getElementById("results");
          results.innerHTML = "";
          status.innerText = "Fetching questions...";

          try {
            const res = await fetch('${backendBaseUrl}/api/questions/');
            const questions = await res.json();

            for (let i = 0; i < questions.length; i++) {
              const q = questions[i];
              status.innerText = "Processing Q" + (i + 1);
              window.ReactNativeWebView?.postMessage("Processing Q" + (i + 1) + ": " + q.question_text);

              const block = document.createElement("div");
              block.className = "question-block";
              block.innerHTML = "<h3>Q" + (i + 1) + ": " + q.question_text + "</h3><p>Loading AI answer...</p>";
              results.appendChild(block);

              try {
                // const aiAnswer = await puter.ai.chat(q.question_text, { model: "gpt-4.1-nano" });
                let aiAnswer = "";
try {
  const aiRes = await fetch('https://api.puter.com/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: q.question_text,
      model: "gpt-4.1-nano"
    })
  });

  const rawText = await aiRes.text(); // In case it fails to parse JSON
  window.ReactNativeWebView?.postMessage("Raw AI response: " + rawText);

  let aiJson;
  try {
    aiJson = JSON.parse(rawText);
  } catch (jsonErr) {
    throw new Error("JSON parse error: " + jsonErr.message + " — Raw: " + rawText);
  }

  aiAnswer = aiJson.response || "⚠️ No 'response' in AI output";
  block.innerHTML += "<p><strong>AI:</strong> " + aiAnswer + "</p>";
} catch (err) {
  block.innerHTML += "<p style='color:red'>❌ AI Error: " + err.message + "</p>";
  window.ReactNativeWebView?.postMessage("AI Error for Q" + (i + 1) + ": " + err.message);
  continue; // Move to the next question even if this fails
}

                block.innerHTML += "<p><strong>AI:</strong> " + aiAnswer + "</p>";

                const saveRes = await fetch('${backendBaseUrl}/api/answers/', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ question: q.id, ai_answer: aiAnswer })
                });

                if (!saveRes.ok) {
                  block.innerHTML += "<p style='color:red'>❌ Error saving answer</p>";
                  window.ReactNativeWebView?.postMessage("Save error for Q" + (i + 1));
                } else {
                  block.innerHTML += "<p style='color:green'>✅ Saved</p>";
                }

              } catch (err) {
                block.innerHTML += "<p style='color:red'>❌ AI Error: " + err.message + "</p>";
                window.ReactNativeWebView?.postMessage("AI Error for Q" + (i + 1) + ": " + err.message);
              }
            }

            status.innerText = "✅ All done";
          } catch (err) {
            window.ReactNativeWebView?.postMessage("Fetch questions error: " + err.message);
            status.innerText = "❌ Failed to load questions";
          }
        }
      </script>
    </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={['*']}
        source={{ html: injectedHTML }}
        javaScriptEnabled={true}
        onMessage={(event) => {
          console.log('📩 Message from WebView:', event.nativeEvent.data);
          Alert.alert('WebView Log', event.nativeEvent.data);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({ container: { flex: 1 } });
export default AnswerGeneratorWebView;
