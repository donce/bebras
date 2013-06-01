package main

import (
	"bufio"
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"math/rand"
	"os"
	"os/exec"
	"strconv"
	"strings"
	"time"
)

var W = flag.Int("w", 100, "width of the board")
var H = flag.Int("h", 100, "height of the board")
var D = flag.Int("d", 1, "number of doors")

type State int

var ticker = time.Tick(1 * time.Minute)

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
	Color    int    `json:"color"`
	Name     string `json:"name"`
	programs [2]*program
	State    State `json:"state"`
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
	pid           int
}

func (p *program) time() float64 {
	out, err := exec.Command(fmt.Sprintf("ps -p %d -o time | tail -n 1", p.pid)).Output()
	if err != nil {
		log.Println("Program", p, "time check failed:", err)
		return -1
	}
	parts := strings.Split(string(out), ":")
	if len(parts) == 0 {
		log.Println("Program", p, "time check failed:", err)
		return -1
	}
	var res, mul float64
	mul = 1
	for i := len(parts) - 1; i >= 0; i-- {
		f, err := strconv.ParseFloat(parts[i], 64)
		if len(parts) == 0 {
			log.Println("Program", p, "time check failed:", err)
			return -1
		}
		res += f * mul
		mul *= 60
	}
	return res
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
		tokens := strings.SplitN(scanner.Text(), " ", 7)
		if len(tokens) != 7 {
			panic("Invalid player definition")
		}
		players = append(players, player{Name: tokens[4], Color: i})
		for j := 0; j < 2; j++ {
			pid, err := strconv.Atoi(tokens[j*3])
			if err != nil {
				panic("Invalid PID")
			}
			players[i].programs[j] = &program{
				coordinates: rndCoords(),
				output:      create(tokens[j*3+2]),
				input:       open(tokens[j*3+1]),
				player:      &players[i],
				pid:         pid,
			}
			fmt.Fprintln(players[i].programs[j].output, *W, *H)
			programs = append(programs, players[i].programs[j])
		}
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
	fmt.Println("[")
	outputJson(programs, doors, players)
	running = len(players)
	openDoors := *D
	for id := 0; openDoors > 0 && running > 0; id = (id + 1) % len(programs) {
		p := programs[perm[id]]
		if p.player.State != StateRunning {
			continue
		}
		fmt.Fprintln(p.output, running*2)
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
		start := p.time()
		var action string
		ch := make(chan bool)
		go func() {
			_, err := fmt.Fscan(p.input, &action)
			if err != nil {
				log.Println("Failed reading input from", p, "-", err)
				ch <- false
			}
			ch <- true
		}()
		for repeat := true; repeat; {
			select {
			case <-ch:
				repeat = false
			case <-ticker:
				if p.time()-start > 1 {
					repeat = false
					log.Println("Time limit exceeded", p)
				}
			}
		}
		switch action {
		case "A":
			p.y--
			if p.y < 1 {
				p.y = *H
			}
		case "V":
			p.y++
			if p.y > *H {
				p.y = *H
			}
		case "K":
			p.x--
			if p.x < 1 {
				p.x = *W
			}
		case "D":
			p.x++
			if p.x > *W {
				p.x = 0
			}
		case "S":
		default:
			log.Println("Invalid action", action)
			p.player.kill()
		}
		if doors[p.coordinates] && p.player.met() {
			p.player.win()
			doors[p.coordinates] = false
			openDoors--
		}
		outputJson(programs, doors, players)
	}
	fmt.Println("]")
}

type figure struct {
	X     int `json:"x"`
	Y     int `json:"y"`
	Color int `json:"color"`
}

type door struct {
	X    int  `json:"x"`
	Y    int  `json:"y"`
	Open bool `json:"open"`
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
		Players []player `json:"players"`
		Figures []figure `json:"figures"`
		Doors   []door   `json:"doors"`
	}{players, figures, doorSlice})
	if err != nil {
		panic(err)
	}
	fmt.Println(string(output))
	fmt.Println(",")
}
