#include <emscripten/emscripten.h>
#include <stdio.h>

extern "C" {
	double EMSCRIPTEN_KEEPALIVE add(double x, double y) { return x + y; }
}