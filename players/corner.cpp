#include <cstdio>
#include <algorithm>
#include <vector>
using namespace std;

int main()
{
	int W, H;
	scanf("%d%d", &W, &H);
	while (1)
	{
		int F, u, x0, y0;
		scanf("%d%d%d%d", &F, &u, &x0, &y0);
		for (int i = 1; i < F; ++i)
		{
			int foo;
			scanf("%d%d%d", &foo, &foo, &foo);
		}
		vector<pair<int, int> > doors;
		int D, x, y;
		scanf("%d", &D);
		for (int i = 0; i < D; ++i)
		{
			scanf("%d%d", &x, &y);
			doors.push_back(make_pair(x, y));
		}
		sort(doors.begin(), doors.end());
		x = doors[0].first;
		y = doors[0].second;
		if (x0 == x && y0 == y)
		{
			puts("S");
		} else if (x0 < x) {
			puts("D");
		} else if (x0 > x) {
			puts("K");
		} else if (y0 < y) {
			puts("V");
		} else if (y0 > y) {
			puts("A");
		}
		fflush(stdout);
	}
	return 0;
}
