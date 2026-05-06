// Minimal stub header to adapt to your llama.cpp build.
// Replace implementations with actual llama.cpp types/functions or
// implement thin wrappers that adapt to the llama.cpp API.

#pragma once
#include <string>
#include <memory>
#include <thread>

struct LLContext {
    struct Params {
        int n_threads = 2;
        int n_ctx = 2048;
    };
    struct EvalParams {
        int max_tokens = 128;
        float temperature = 0.7f;
        float top_p = 0.95f;
    };

    LLContext() = delete;
    LLContext(const LLContext&) = delete;
    LLContext(LLContext&&) = default;

    // construct from model (placeholder)
    LLContext(/*LLModel& model*/ const void* model, const Params& p) { (void)model; (void)p; }

    // Evaluate + sample -> returns generated text
    std::string evaluateAndSample(const std::string& prompt, const EvalParams& p) {
        (void)prompt; (void)p;
        // TODO: implement via llama.cpp API calls:
        //  - tokenize prompt
        //  - llama_eval
        //  - llama_sample token loop
        return std::string("[MOCK] inference not implemented; replace with llama.cpp calls");
    }
};

struct LLModel {
    LLModel() = delete;
    LLModel(const LLModel&) = delete;

    static LLModel* loadFromFile(const std::string& path) {
        (void)path;
        // TODO: call llama.cpp model loader, return pointer
        return nullptr;
    }
};