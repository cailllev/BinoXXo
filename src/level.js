"use strict";
class Level {

    constructor(size, coverage, data) {

        this.done = false;
        this.size = size;
        this.field = [];
        this.userField = [];
        this.possibilities = [];

        if (data === undefined) {
            if (size % 2 != 0 || size < 4){
                throw new Error("Size must not be odd and greater or equal to 4!");
            }

            if (coverage < 0.4 || coverage > 0.8) {
                throw new Error("Coverage of the field must be between 0.4 and 0.8");
            }

            for (let i = 0; i < size; i++){
                let row = [];
                let userRow = [];
                let poss = [];

                for (let j = 0; j < size; j++){
                    row.push(-1);
                    userRow.push(-1);
                    poss.push([0,1]);
                }
                this.field.push(row);
                this.userField.push(userRow);
                this.possibilities.push(poss);
            }

            this.generateField();
            this.deleteRandomValues(coverage);

            // copy all values from field to userFields
            for (let y = 0; y < this.size; y++) {
                for (let x = 0; x < this.size; x++) {
                    this.userField[y][x] = this.field[y][x];
                }
            }

        } else {
            for (let prop in data){
                this[prop] = data[prop];
            }
        }
    }

    testFinished() {
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                if (!this.checkValidInput(this.userField, this.userField[y][x], x, y, false)) {
                    return false;
                }
            }
        }
        return true;
    }

    setValueInUserField(x, y) {
        //cannot overwrite values given from field
        if (this.field[y][x] !== -1) {
            return false;
        }

        let val = this.userField[y][x] + 1;
        if (val === 2) {
            val = -1;
        }

        this.userField[y][x] = val;
        return val;
    }

    generateField(){
        for (let y = 0; y < this.size; y++){
            for (let x = 0; x < this.size; x++){

                //evaluate (and remove) possibility 0
                if (!this.checkValidInput(this.field, 0, x, y, true)) {
                    let i = this.possibilities[y][x].indexOf(0);
                    this.possibilities[y][x].splice(i, i + 1);
                }

                //evaluate (and remove) possibility 1
                if (!this.checkValidInput(this.field, 1, x, y, true)) {
                    let i = this.possibilities[y][x].indexOf(1);
                    this.possibilities[y][x].splice(i, i + 1);
                }

                //chose value from remaining possibilities
                if (this.possibilities[y][x].length === 2) {
                    this.field[y][x] = this.get0or1();
                }
                else if (this.possibilities[y][x].length === 1) {
                    this.field[y][x] = this.possibilities[y][x][0];
                }

                //backtrack to last point where there were 2 possibilities
                else {
                    this.possibilities[y][x] = [0, 1];
                    [x, y] = this.resetXandY(x, y);

                    //step back until 2 possibilities found and reset everything
                    while (this.possibilities[y][x].length === 1){
                        this.possibilities[y][x] = [0, 1];
                        this.field[y][x] = -1;
                        [x, y] = this.resetXandY(x, y);
                    }

                    //another poss found, remove current value (not valid)
                    if (this.field[y][x] === 0) {
                        this.possibilities[y][x].shift()
                    } else {
                        this.possibilities[y][x].pop()
                    }

                    //try all with inverse value
                    this.field[y][x] = this.field[y][x] ^ 1;
                }
            }
        }
    }

    resetXandY(x, y){
        if (x > 0){
            x--;
        } else {
            y--;
            x = this.size - 1;
        }
        return [x, y];
    }

    deleteRandomValues(coverage){
        let toDelete = (1 - coverage) * this.size * this.size;

        for (let i = 0; i < toDelete; i++) {
            let x;
            let y;
            let found = false;
            do {
                x = Math.floor(Math.random() * this.size);
                y = Math.floor(Math.random() * this.size);
                if (this.field[y][x] !== -1) {
                    found = true;
                    this.field[y][x] = -1;
                }
            } while (!found);
        }
    }

    get0or1(){
        if (Math.random() < 0.5) {
            return 0;
        }
        return 1;
    }

    getSymbol(nr){
        if (nr === 0) {
            return "o";
        } else if (nr === 1) {
            return "x";
        } else {
            return " ";
        }
    }

    checkValidInput(field, input, posX, posY, newSym){
        if (input == -1) {
            return false;
        }

        // check line X
        if (!this.isSymbolValidPerLine(field, input, posY, false, newSym)){
           return false;
        }

        //check if line X already exists
        if (posY === this.size) {
            for (let i = 0; i < posX; i++) {
                let equal = true;

                //check each line if its equal
                for (let j = 0; j < this.size; j++) {
                    if (field[j][i] !== field[j][posX]) {
                        equal = false;
                        break;
                    }
                }

                if (equal) {
                    return false;
                }
            }
        }

        //   ? ? x
        if (posX - 2 >= 0) {
            if (field[posY][posX - 1] === input && field[posY][posX - 2] === input) {
                return false;
            }
        }

        //  x ? ?
        if (posX + 2 < this.size){
            if (field[posY][posX + 1] === input && field[posY][posX + 2] === input) {
                return false;
            }
        }

        //  ? x ?
        if (posX - 1 >= 0 && posX + 1 < this.size){
            if (field[posY][posX - 1] === input && field[posY][posX + 1] === input) {
                return false;
            }
        }

        // check Y
        if (!this.isSymbolValidPerLine(field, input, posX, true, newSym)){
           return false;
        }

        //check if line Y already exists
        if (posX === this.size) {
            for (let i = 0; i < posY; i++) {
                let equal = true;

                //check each line if its equal
                for (let j = 0; j < this.size; j++) {
                    if (field[i][j] !== field[posY][j]) {
                        equal = false;
                        break;
                    }
                }

                if (equal) {
                    return false;
                }
            }
        }

        if (posY - 2 >= 0) {
            if (field[posY - 1][posX] === input && field[posY - 2][posX] === input) {
                return false;
            }
        }

        if (posY + 2 < this.size){
            if (field[posY + 1][posX] === input && field[posY + 2][posX] === input) {
                return false;
            }
        }

        if (posY - 1 >= 0 && posY + 1 < this.size){
            if (field[posY - 1][posX] === input && field[posY + 1][posX] === input) {
                return false;
            }
        }

        return true;
    }

    isSymbolValidPerLine(field, symbol, line, checkVertical, newSym) {
        let count;
        if (newSym) {
            count = 1;
        } else {
            count = 0;
        }

        if (checkVertical) {
            for (let i = 0; i < this.size; i++){
                if (field[i][line] === symbol){
                    count++;
                }
            }

        } else {
            for (let i = 0; i < this.size; i++){
                if (field[line][i] === symbol){
                    count++;
                }
            }
        }

        if (count > this.size / 2){
            return false;
        }

        return true;
    }

    toString(){
        let s = "Level\n";

        for (let y = 0; y < this.size; y++){
            for (let x = 0; x < this.size; x++) {
                s += this.getSymbol(this.field[y][x]) + " ";
            }
            s = s.slice(0, -1) + "\n";
        }

        return s;
    }
}
