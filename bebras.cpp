#include <stdlib.h>
#include <iostream>
#include <fstream>
#include <vector>
#include <sys/types.h>
#include <sys/stat.h>

#define INPUT_FILE "input"
#define LOGIC_FILE "logic"
#define DATA_FILE "data"

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

string getExtension(const char *filename) {
	string str = filename;
	int pos = str.rfind(".", str.length());
	if (pos == -1)
		return "";
	return str.substr(pos+1, str.length() - pos - 1);
}

bool compile(const char *source, const char *binary) {
	string ext = getExtension(source);
	if (ext == "pas") {
		sprintf(command, "fpc -o%s %s", binary, source);
	}
	else if (ext == "cpp" || ext == "c") {
		sprintf(command, "g++ -o %s %s", binary, source);
	}
	char command[255];
	int result = system(command);
	cout << result << endl;
	return (result == 0);
}

int main() {
	read(INPUT_FILE);

	ofstream fdata(DATA_FILE);
	for (int i = 0; i < 1/*programs.size()*/; ++i) {
		cout << i << programs[i].name << endl;
		char bin[255];
		sprintf(bin, "bin%d", i);
		if (!compile(programs[i].filename.c_str(), "bin")) {
			cout << "Compile error" << endl;
		}
		for (int j = 0; j < 2; ++j) {
			char fifoIn[255], fifoOut[255];
			sprintf(fifoIn, "fifo_%d_%d_in", i, j);
			sprintf(fifoOut, "fifo_%d_%d_out", i, j);
			if (mkfifo(fifoIn, S_IRWXU)) {
				cout << "Failed creating input fifo." << endl;
				return 0;
			}
			if (mkfifo(fifoOut, S_IRWXU)) {
				cout << "Failed creating output fifo." << endl;
				return 0;
			}
			char command[255];
			//sprintf(command, "./%s < %s > %s", bin, fifoIn, fifoOut);
			//system(command);
		}
	}
	fdata.close();

	char command[255];
	sprintf(command, "go run %s -w %d -h %d -d %d %s", LOGIC_FILE, width, height, doors, DATA_FILE);
	system(command);
	return 0;
}
