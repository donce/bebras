#include <iostream>
#include <fstream>
#include <vector>
#include <sys/types.h>
#include <sys/stat.h>

using namespace std;

int width, height;
int doors;

struct Program {
	string name;
	string filename;
};

vector<Program> programs;

void read(const char *filename) {
	ifstream f(filename);

	f >> width >> height;
	f >> doors;
	Program program;
	while (f >> program.name >> program.filename) {
		programs.push_back(program);
	}
	f.close();
}

int main() {
	read("input");
	for (int i = 0; i < programs.size(); ++i) {
		cout << i << programs[i].name << endl;
	}
	return 0;
}
