#ifndef CGINT128_H
#define CGINT128_H

#include "int128.h"
#include <nan.h>

class cgint128 : public Nan::ObjectWrap
{
public:
    /* data */
    uint128 value;

public:
    static void Init(v8::Local<v8::Object> exports);
    
private:
    explicit cgint128();
    explicit cgint128(const std::string &num);
    explicit cgint128(uint64 num) : value(num){};
    explicit cgint128(uint64 top, uint64 bottom) : value(top, bottom){};
    ~cgint128();

    static void New(const Nan::FunctionCallbackInfo<v8::Value> &info);
    static void Plus(const Nan::FunctionCallbackInfo<v8::Value>& info);
    static void Sub(const Nan::FunctionCallbackInfo<v8::Value>& info);
    static void Mult(const Nan::FunctionCallbackInfo<v8::Value>& info);
    static void Div(const Nan::FunctionCallbackInfo<v8::Value>& info);
    static void compare(const Nan::FunctionCallbackInfo<v8::Value>& info);
    static Nan::Persistent<v8::Function> constructor;

    static void GetValue(v8::Local<v8::String> property, const Nan::PropertyCallbackInfo<v8::Value> &info);
    static void GetTop(v8::Local<v8::String> property, const Nan::PropertyCallbackInfo<v8::Value> &info);
    static void GetBottom(v8::Local<v8::String> property, const Nan::PropertyCallbackInfo<v8::Value> &info);

    
    
    
};
#endif