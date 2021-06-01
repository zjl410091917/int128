#include "cgint128.h"
#include <iostream>
#include <string>
Nan::Persistent<v8::Function> cgint128::constructor;

cgint128::cgint128() : value(0)
{
}
cgint128::cgint128(const std::string &str) : value(0)
{
    const char *ch = str.c_str();
    int len = str.length();
    for (int i = 0; i < len; ++i)
    {
        int add = ch[i] - '0';
        value = value * 10 + add;
    }
}
cgint128::~cgint128() {}

void cgint128::Init(v8::Local<v8::Context> context, v8::Local<v8::Object> exports)
{
    // v8::Local<v8::Context> context = exports->CreationContext();
    Nan::HandleScope scope;

    // Prepare constructor template
    v8::Local<v8::FunctionTemplate> tpl = Nan::New<v8::FunctionTemplate>(New);
    tpl->SetClassName(Nan::New("cgint128").ToLocalChecked());
    v8::Local<v8::ObjectTemplate> proto = tpl->InstanceTemplate();
    tpl->InstanceTemplate()->SetInternalFieldCount(1);

    // Prototype
    // Nan::SetPrototypeMethod(tpl, "value", GetValue);
    Nan::SetPrototypeMethod(tpl, "plus", Plus);
    Nan::SetPrototypeMethod(tpl, "sub", Sub);
    Nan::SetPrototypeMethod(tpl, "mult", Mult);
    Nan::SetPrototypeMethod(tpl, "div", Div);
    Nan::SetPrototypeMethod(tpl, "compare", compare);
    //   Nan::SetPrototypeMethod(tpl, "multiply", Multiply);
    Nan::SetAccessor(proto, Nan::New("value").ToLocalChecked(), GetValue);
    Nan::SetAccessor(proto, Nan::New("n1").ToLocalChecked(), GetN1);
    Nan::SetAccessor(proto, Nan::New("n2").ToLocalChecked(), GetN2);
    Nan::SetAccessor(proto, Nan::New("n3").ToLocalChecked(), GetN3);
    Nan::SetAccessor(proto, Nan::New("n4").ToLocalChecked(), GetN4);
    Nan::SetAccessor(proto, Nan::New("top").ToLocalChecked(), GetTop);
    Nan::SetAccessor(proto, Nan::New("bottom").ToLocalChecked(), GetBottom);

    constructor.Reset(tpl->GetFunction(context).ToLocalChecked());
    exports->Set(context,
                 Nan::New("Int128").ToLocalChecked(),
                 tpl->GetFunction(context).ToLocalChecked());
}

void cgint128::New(const Nan::FunctionCallbackInfo<v8::Value> &info)
{
    v8::Local<v8::Context> context = info.GetIsolate()->GetCurrentContext();
    v8::Isolate *isolate = info.GetIsolate();

    if (info.IsConstructCall())
    {

        if (info.Length() == 0)
        {
            cgint128 *obj = new cgint128();
            obj->Wrap(info.This());
            info.GetReturnValue().Set(info.This());
        }
        else if (info.Length() == 1)
        {
            if (info[0]->IsString())
            {
                v8::String::Utf8Value str(isolate, info[0]);
                std::string cppStr(*str);
                cgint128 *obj = new cgint128(cppStr);
                obj->Wrap(info.This());
                info.GetReturnValue().Set(info.This());
            }
            else if (info[0]->IsNumber())
            {
                cgint128 *obj = new cgint128(info[0]->IntegerValue(context).FromJust());
                obj->Wrap(info.This());
                info.GetReturnValue().Set(info.This());
            }
            else
            {
                cgint128 *obj = new cgint128();
                obj->Wrap(info.This());
                info.GetReturnValue().Set(info.This());
            }
        }
        else if (info.Length() == 2)
        {
            uint64 top = 0, bottom = 0;
            if (info[0]->IsString())
            {
                v8::String::Utf8Value str(isolate, info[0]);
                std::string cppStr(*str);
                bottom = atoll(cppStr.c_str());                
            }
            else
            {
                bottom = info[0]->IntegerValue(context).FromJust();
            }
            if (info[1]->IsString())
            {
                v8::String::Utf8Value str(isolate, info[1]);
                std::string cppStr(*str);                
                top = atoll(cppStr.c_str());
            }
            else
            {
                top = info[1]->IntegerValue(context).FromJust();
            }                        
            cgint128 *obj = new cgint128(top, bottom);
            obj->Wrap(info.This());
            info.GetReturnValue().Set(info.This());
        }else if(info.Length() == 4){
            uint32 n1 = info[0]->IntegerValue(context).FromJust();
            uint32 n2 = info[1]->IntegerValue(context).FromJust();
            uint32 n3 = info[2]->IntegerValue(context).FromJust();
            uint32 n4 = info[3]->IntegerValue(context).FromJust();
            uint64 top = 0, bottom = 0;
            bottom = (uint64)n2 << 32 | n1;
            top =(uint64)n4 << 32 | n3;
            std::cout<<n1<<" "<<n2<<" "<<n3<<" "<<n4<<std::endl;
            std::cout<<bottom<< " "<<top <<std::endl;
            cgint128 *obj = new cgint128(top, bottom);
            obj->Wrap(info.This());
            info.GetReturnValue().Set(info.This());
        }
    }
    else
    {
        // Invoked as plain function `MyObject(...)`, turn into construct call.
        const int argc = 1;
        v8::Local<v8::Value> argv[argc] = {info[0]};
        v8::Local<v8::Function> cons = Nan::New<v8::Function>(constructor);
        info.GetReturnValue().Set(
            cons->NewInstance(context, argc, argv).ToLocalChecked());
    }
}

void cgint128::GetValue(v8::Local<v8::String> property, const Nan::PropertyCallbackInfo<v8::Value> &info)
{
    cgint128 *obj = ObjectWrap::Unwrap<cgint128>(info.Holder());
    std::string num = obj->value.toString();
    info.GetReturnValue().Set(Nan::New(num.c_str()).ToLocalChecked());
}

void cgint128::GetTop(v8::Local<v8::String> property, const Nan::PropertyCallbackInfo<v8::Value> &info)
{
    cgint128 *obj = ObjectWrap::Unwrap<cgint128>(info.Holder());
    uint64 top = Uint128High64(obj->value);
    char temp[20] = {'\0'};
    temp[0] = '\0';
    sprintf(temp, "%lld", top);
    info.GetReturnValue().Set(Nan::New(temp).ToLocalChecked());
}

void cgint128::GetBottom(v8::Local<v8::String> property, const Nan::PropertyCallbackInfo<v8::Value> &info)
{
    cgint128 *obj = ObjectWrap::Unwrap<cgint128>(info.Holder());
    uint64 top = Uint128Low64(obj->value);
    char temp[20] = {'\0'};
    sprintf(temp, "%lld", top);
    info.GetReturnValue().Set(Nan::New(temp).ToLocalChecked());
}

void cgint128::GetN1(v8::Local<v8::String> property, const Nan::PropertyCallbackInfo<v8::Value> &info)
{
    cgint128 *obj = ObjectWrap::Unwrap<cgint128>(info.Holder());
    uint64 n = Uint128Low64(obj->value);
    int32 n1 = (int32)n;
    info.GetReturnValue().Set(n1);
}
void cgint128::GetN2(v8::Local<v8::String> property, const Nan::PropertyCallbackInfo<v8::Value> &info)
{
    cgint128 *obj = ObjectWrap::Unwrap<cgint128>(info.Holder());
    uint64 n = Uint128Low64(obj->value);
    int32 n2 = (int32)(n>>32);    
    info.GetReturnValue().Set(n2);
}
void cgint128::GetN3(v8::Local<v8::String> property, const Nan::PropertyCallbackInfo<v8::Value> &info)
{
    cgint128 *obj = ObjectWrap::Unwrap<cgint128>(info.Holder());
    uint64 n = Uint128High64(obj->value);
    int32 n3 = (int32)n;    
    info.GetReturnValue().Set(n3);
}
void cgint128::GetN4(v8::Local<v8::String> property, const Nan::PropertyCallbackInfo<v8::Value> &info)
{
    cgint128 *obj = ObjectWrap::Unwrap<cgint128>(info.Holder());
    uint64 n = Uint128High64(obj->value);
    int32 n4 = (int32)(n>>32);
    info.GetReturnValue().Set(n4);
}

void cgint128::Plus(const Nan::FunctionCallbackInfo<v8::Value> &info)
{
    v8::Local<v8::Context> context = info.GetIsolate()->GetCurrentContext();
    cgint128 *obj = ObjectWrap::Unwrap<cgint128>(info.Holder());
    cgint128 *other = Nan::ObjectWrap::Unwrap<cgint128>(
        info[0]->ToObject(context).ToLocalChecked());
    obj->value += other->value;
}
void cgint128::Sub(const Nan::FunctionCallbackInfo<v8::Value> &info)
{
    v8::Local<v8::Context> context = info.GetIsolate()->GetCurrentContext();
    cgint128 *obj = ObjectWrap::Unwrap<cgint128>(info.Holder());
    cgint128 *other = Nan::ObjectWrap::Unwrap<cgint128>(
        info[0]->ToObject(context).ToLocalChecked());
    obj->value -= other->value;
}
void cgint128::Mult(const Nan::FunctionCallbackInfo<v8::Value> &info)
{
    v8::Local<v8::Context> context = info.GetIsolate()->GetCurrentContext();
    cgint128 *obj = ObjectWrap::Unwrap<cgint128>(info.Holder());
    cgint128 *other = Nan::ObjectWrap::Unwrap<cgint128>(
        info[0]->ToObject(context).ToLocalChecked());
    obj->value *= other->value;
}
void cgint128::Div(const Nan::FunctionCallbackInfo<v8::Value> &info)
{
    v8::Local<v8::Context> context = info.GetIsolate()->GetCurrentContext();
    cgint128 *obj = ObjectWrap::Unwrap<cgint128>(info.Holder());
    cgint128 *other = Nan::ObjectWrap::Unwrap<cgint128>(
        info[0]->ToObject(context).ToLocalChecked());
    obj->value /= other->value;
}

void cgint128::compare(const Nan::FunctionCallbackInfo<v8::Value> &info)
{
    v8::Local<v8::Context> context = info.GetIsolate()->GetCurrentContext();
    cgint128 *obj = ObjectWrap::Unwrap<cgint128>(info.Holder());
    cgint128 *other = Nan::ObjectWrap::Unwrap<cgint128>(
        info[0]->ToObject(context).ToLocalChecked());
    if(obj->value > other->value){
        info.GetReturnValue().Set(1);
    }else if(obj->value == other->value){
        info.GetReturnValue().Set(0);
    }else {
        info.GetReturnValue().Set(-1);
    }
}