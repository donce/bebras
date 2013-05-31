package main

import (
	"bufio"
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"math/rand"
	"os"
	"strings"
	"time"
)

var W = flag.Int("w", 100, "width of the board")
var H = flag.Int("h", 100, "height of the board")
var D = flag.Int("d", 1, "number of doors")

type State int

const (
	StateRunning State = iota
	StateKilled
	StateWon
)

func (s State) MarshalJSON() ([]byte, error) {
	switch s {
	case StateRunning:
		return []byte(`"Veikia"`), nil
	case StateKilled:
		return []byte(`"Babakšt"`), nil
	case StateWon:
		return []byte(`"Laimėjo"`), nil
	}
	panic("Invalid state")
}

type player struct {
	Color    int
	Name     string
	programs [2]*program
	State    State
}

var running int

func (p *player) kill() {
	p.State = StateKilled
	running--
}

func (p *player) win() {
	p.State = StateWon
	running--
}

func (p *player) met() bool {
	return p.programs[0].coordinates == p.programs[1].coordinates
}

type coordinates struct {
	x, y int
}

type program struct {
	coordinates
	input, output *os.File
	player        *player
}

func open(file string) *os.File {
	f, err := os.Open(file)
	if err != nil {
		panic(err)
	}
	return f
}

func create(file string) *os.File {
	f, err := os.Create(file)
	if err != nil {
		panic(err)
	}
	return f
}

func rndCoords() coordinates {
	return coordinates{rand.Intn(*W) + 1, rand.Intn(*H) + 1}
}

func main() {
	rand.Seed(time.Now().UnixNano())
	flag.Parse()
	if flag.NArg() != 1 {
		panic("Input file?")
	}
	if *D > *W**H {
		panic("More doors than cells")
	}
	data := open(flag.Arg(0))
	var players []player
	var programs []*program
	scanner := bufio.NewScanner(data)
	for i := 0; scanner.Scan(); i++ {
		tokens := strings.SplitN(scanner.Text(), " ", 5)
		if len(tokens) != 5 {
			panic("Invalid player definition")
		}
		players[i].Name = tokens[4]
		for j := 0; j < 2; j++ {
			players[i].programs[j] = &program{
				coordinates: rndCoords(),
				input:       open(tokens[j*2]),
				output:      create(tokens[j*2+1]),
				player:      &players[i],
			}
			programs = append(programs, players[i].programs[j])
		}
		players[i].Color = i
	}
	if *D >= len(players) {
		panic("There should be less doors than players")
	}
	perm := rand.Perm(len(programs))
	if err := scanner.Err(); err != nil {
		panic(err)
	}
	doors := make(map[coordinates]bool)
	for i := 0; i < *D; i++ {
		c := rndCoords()
		if doors[c] {
			i--
		} else {
			doors[c] = true
		}
	}
	outputJson(programs, doors, players)
	running = len(players)
	openDoors := *D
	for id := 0; openDoors > 0 && running > 0; id = (id + 1) % len(programs) {
		p := programs[perm[id]]
		if p.player.State != StateRunning {
			continue
		}
		fmt.Fprintln(p.output, running)
		fmt.Fprintln(p.output, id+1, p.x, p.y)
		for id2, i := range perm {
			if p2 := programs[i]; id2 != id && p2.player.State == StateRunning {
				fmt.Fprintln(p.output, id2+1, p2.x, p2.y)
			}
		}
		fmt.Fprintln(p.output, len(doors))
		for d, open := range doors {
			if open {
				fmt.Fprintln(p.output, d.x, d.y)
			}
		}
		// TODO: laiko limitas
		var action string
		fmt.Fscan(p.input, &action)
		switch action {
		case "A":
			p.y--
		case "V":
			p.y++
		case "K":
			p.x--
		case "D":
			p.x++
		case "S":
		default:
			log.Println("Invalid action", action)
			p.player.kill()
		}
		if doors[p.coordinates] && p.player.met() {
			p.player.win()
			doors[p.coordinates] = false
		}
		outputJson(programs, doors, players)
	}
}

type figure struct {
	X, Y, Color int
}

type door struct {
	X, Y int
	Open bool
}

func outputJson(programs []*program, doors map[coordinates]bool, players []player) {
	var figures []figure
	for _, p := range programs {
		if p.player.State == StateRunning {
			figures = append(figures, figure{p.x, p.y, p.player.Color})
		}
	}
	doorSlice := make([]door, 0, len(doors))
	for c, state := range doors {
		doorSlice = append(doorSlice, door{c.x, c.y, state})
	}
	output, err := json.Marshal(struct {
		Players []player
		Figures []figure
		Doors   []door
	}{players, figures, doorSlice})
	if err != nil {
		panic(err)
	}
	fmt.Println(string(output))
}
