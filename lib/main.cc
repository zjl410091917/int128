#include <nan.h>
#include "cgint128.h"

void Int64High(const Nan::FunctionCallbackInfo<v8::Value> &info)
{
    v8::Local<v8::Context> context = info.GetIsolate()->GetCurrentContext();

    if (info.Length() != 1)
    {
        Nan::ThrowTypeError("Wrong number of arguments");
        return;
    }

    if (!info[0]->IsNumber())
    {
        Nan::ThrowTypeError("Wrong arguments");
        return;
    }

    uint64_t arg0 = info[0]->NumberValue(context).FromJust();
    int32_t n = (int32_t)(arg0 >> 32);
    info.GetReturnValue().Set(n);
}

void Int64Low(const Nan::FunctionCallbackInfo<v8::Value> &info)
{
    v8::Local<v8::Context> context = info.GetIsolate()->GetCurrentContext();

    if (info.Length() != 1)
    {
        Nan::ThrowTypeError("Wrong number of arguments");
        return;
    }

    if (!info[0]->IsNumber())
    {
        Nan::ThrowTypeError("Wrong arguments");
        return;
    }

    uint64_t arg0 = info[0]->NumberValue(context).FromJust();
    int32_t n = (int32_t)(arg0);
    info.GetReturnValue().Set(n);
}

void InitAll(v8::Local<v8::Object> exports, v8::Local<v8::Object> module)
{
    v8::Local<v8::Context> context = exports->CreationContext();
    exports->Set(context,
                Nan::New("Int64High").ToLocalChecked(),
                Nan::New<v8::FunctionTemplate>(Int64High)
                    ->GetFunction(context)
                    .ToLocalChecked());
    exports->Set(context,
                Nan::New("Int64Low").ToLocalChecked(),
                Nan::New<v8::FunctionTemplate>(Int64Low)
                    ->GetFunction(context)
                    .ToLocalChecked());
    cgint128::Init(context, exports);
}

NODE_MODULE(cgint128, InitAll)
