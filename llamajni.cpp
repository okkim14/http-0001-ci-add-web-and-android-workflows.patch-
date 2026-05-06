/*
  llamajni.cpp
  JNI bridge for Android app to call into llama.cpp compiled as native lib.

  Exposes:
   - Java_org_agent_LLMBridge_initModel
   - Java_org_agent_LLMBridge_infer

  Notes:
   - llama.cpp's exact C++ API evolves. Adapt the llama_* calls below to match
     the llama.cpp headers you built. This file assumes a thin wrapper around
     a "Model" and "Context" concept. If symbols differ, replace calls accordingly.
   - Build with -fexceptions and link to the llama static library (libllama.a)
     or compile llama.cpp as part of CMake add_subdirectory.
*/

#include <jni.h>
#include <string>
#include <mutex>
#include <memory>
#include <vector>

// include llama.cpp header(s) as available
// e.g. #include "llama.h"
// You must adjust these includes to match your llama.cpp version.
#include "llama_api_stub.h" // <-- create small local header mapping to llama.cpp API or replace with actual header

static std::mutex model_mutex;
static std::unique_ptr<LLModel> g_model;     // LLModel is placeholder type from llama_api_stub.h
static std::unique_ptr<LLContext> g_ctx;     // LLContext placeholder

extern "C" JNIEXPORT jboolean JNICALL
Java_org_agent_LLMBridge_initModel(JNIEnv* env, jclass /*cls*/, jstring jModelPath) {
    const char* modelPath = env->GetStringUTFChars(jModelPath, nullptr);
    bool ok = false;
    {
        std::lock_guard<std::mutex> lock(model_mutex);
        try {
            // Example flow:
            //  - load model file into LLModel
            //  - create inference context with desired params
            if (g_model) {
                // already loaded: free first
                g_ctx.reset();
                g_model.reset();
            }
            g_model.reset(LLModel::loadFromFile(std::string(modelPath)));
            if (!g_model) {
                ok = false;
            } else {
                // create context with default params (adjust heap/threads as needed)
                LLContext::Params p;
                p.n_threads = std::max(1, (int)std::thread::hardware_concurrency() - 1);
                p.n_ctx   = 2048; // default context window; tune down if OOM
                g_ctx.reset(new LLContext(*g_model, p));
                ok = (bool)g_ctx;
            }
        } catch (...) {
            ok = false;
        }
    }
    env->ReleaseStringUTFChars(jModelPath, modelPath);
    return ok ? JNI_TRUE : JNI_FALSE;
}

extern "C" JNIEXPORT jstring JNICALL
Java_org_agent_LLMBridge_infer(JNIEnv* env, jclass /*cls*/, jstring jPrompt, jint maxTokens) {
    const char* prompt = env->GetStringUTFChars(jPrompt, nullptr);
    std::string output = "";
    {
        std::lock_guard<std::mutex> lock(model_mutex);
        if (!g_ctx) {
            output = "[ERROR] model not initialized";
        } else {
            try {
                // Simple synchronous inference workflow:
                // 1) tokenize prompt
                // 2) evaluate prompt
                // 3) sample tokens until maxTokens or EOS
                LLContext::EvalParams eparams;
                eparams.max_tokens = (int)maxTokens;
                eparams.temperature = 0.7f;
                eparams.top_p = 0.95f;

                output = g_ctx->evaluateAndSample(std::string(prompt), eparams);
            } catch (const std::exception& ex) {
                output = std::string("[EXCEPTION] ") + ex.what();
            } catch (...) {
                output = "[EXCEPTION] unknown";
            }
        }
    }
    env->ReleaseStringUTFChars(jPrompt, prompt);
    return env->NewStringUTF(output.c_str());
}