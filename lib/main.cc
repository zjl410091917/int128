#include <nan.h>
#include "cgint128.h"


void InitAll(v8::Local<v8::Object> exports)
{    
    cgint128::Init(exports);
}

NODE_MODULE(cgint128, InitAll)
