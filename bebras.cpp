#include <stdlib.h>
#include <iostream>
#include <fstream>
#include <vector>
#include <sys/types.h>
#include <sys/stat.h>
#include <unistd.h>

#define INPUT_FILE "input"
#define LOGIC_FILE "bebras.go"
#define DATA_FILE "data"
#define PLAYERS_DIR "players/"

#define TEMP_DIR "temp/"

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
	cout << "-----------------------------------" << endl;
	cout << "Compiling " << source << endl;
	char command[255];
	string ext = getExtension(source);
	if (ext == "pas") {
		sprintf(command, "fpc -o%s players/%s", binary, source);
	}
	else if (ext == "cpp" || ext == "c") {
		sprintf(command, "g++ -o %s players/%s", binary, source);
	}
	int result = system(command);
	cout << "-----------------------------------" << endl;
	return (result == 0);
}

int main() {
	read(INPUT_FILE);

	system("rm -rf temp");
	system("mkdir temp");

	ofstream fdata(TEMP_DIR DATA_FILE);
	for (int i = 0; i < programs.size(); ++i) {
		char bin[255];
		sprintf(bin, TEMP_DIR"user_bin%d", i);
		if (!compile(programs[i].filename.c_str(), bin)) {
			cout << ">>>>>>>>> Failed to compile: " << programs[i].filename << endl;
			cout << "Compile error" << endl;
			continue;
		}
		//cout << "Starting program: " << programs[i].name << endl;
		for (int j = 0; j < 2; ++j) {
			char fifoIn[255], fifoOut[255];
			sprintf(fifoIn, TEMP_DIR"fifo_%d_%d_in", i, j);
			sprintf(fifoOut, TEMP_DIR"fifo_%d_%d_out", i, j);
			if (mkfifo(fifoIn, S_IRWXU)) {
				cout << "Failed creating input fifo." << endl;
				return 0;
			}
			if (mkfifo(fifoOut, S_IRWXU)) {
				cout << "Failed creating output fifo." << endl;
				return 0;
			}
			char command[255];
			sprintf(command, "%s > %s < %s &", bin, fifoOut, fifoIn);
			pid_t pid = fork();
			if (pid == 0) {
				freopen(fifoIn, "r", stdin);
				freopen(fifoOut, "w", stdout);
				execl(bin, "bebras", (char*)0);
				cout << "child " << bin << endl;
				return 0;
			}
			else {
				fdata << pid << ' ';
			}
			fdata << fifoOut << ' ' << fifoIn << ' ';
			//cout << "ID:" << system(command) << endl;
		}
		fdata << programs[i].name << endl;
	}
	fdata.close();

	cout << "Starting logic" << endl;
	char command[255];
	//TODO:tee?
	//system("rm open.js");
	system("echo 'var game = ' > visualization/generated.js");
	sprintf(command, "go run %s -w %d -h %d -d %d %s | tee -a 'visualization/generated.js'", LOGIC_FILE, width, height, doors, TEMP_DIR DATA_FILE);
	system(command);
	system("cat visualization/drawTable.js >> visualization/generated.js");
	cout << "Finished." << endl;
	system("xdg-open visualization/generated.html");
	return 0;
}
