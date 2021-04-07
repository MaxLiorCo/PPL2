import { CExp, parseL3Exp, Exp, isAppExp, isBoolExp, isDefineExp, isIfExp, isNumExp, isPrimOp, isProcExp, isProgram, isVarRef, ProcExp, Program, VarDecl, DefineExp, AppExp } from '../imp/L3-ast';
import { compoundSExpToString, isCompoundSExp, isEmptySExp, isSymbolSExp, Value } from '../imp/L3-value';
import { bind, Result, makeOk } from '../shared/result';
import { isNumber } from '../shared/type-predicates';
import { map } from "ramda";
import {parse as p} from '../shared/parser'

const unparseLExps = (les: Exp[]): string =>
    map(unparse, les).join("\n");

export const valueToString = (val: Value): string =>
    isNumber(val) ?  val.toString() :
    val === true ? 'true' :
    val === false ? 'false' :
    isPrimOp(val) ? val.op :
    isSymbolSExp(val) ? val.val :
    isEmptySExp(val) ? " " :
    isCompoundSExp(val) ? compoundSExpToString(val) :
    "never";

export const unparsePrimOp = (op: CExp, exps: Exp[]): string => {
    if (isPrimOp(op)) {
        if (["+", "-", "/", "*", "<", ">" , "=", "eq?", "and", "or"].includes(op.op)) {
            return map(unparse, exps).join(` ${op.op === ("=" || "eq?") ? `==` : op.op} `);
        }
        return  op.op === "number?" ? `lambda ${map(unparse, exps)} : (type(${map(unparse, exps)}) == number)` :
                op.op === "boolean?" ? `lambda ${map(unparse, exps)} : (type(${map(unparse, exps)}) == bool)` : 
                op.op === "not" ? `not ${map(unparse, exps).join(" ")}` :
                "never";
    }
    return "never";
}

export const unparseAppExp = (ae: AppExp): string =>
    isPrimOp(ae.rator) ? `(${unparsePrimOp(ae.rator, ae.rands)})` :
    isProcExp(ae.rator) ? `${unparseProcExp(ae.rator)}(${map(unparse, ae.rands).join(",")})`:
    `${unparse(ae.rator)}(${map(unparse, ae.rands).join(",")})`;        //this is a function like (f 3 4)

const unparseProcExp = (pe: ProcExp): string => 
    `(lambda ${map((p: VarDecl) => p.var, pe.args).join(",")} : ${unparseLExps(pe.body)})`

const unparseDefineExp = (de: DefineExp): string =>
    `${de.var.var} = ${unparse(de.val)}`

/*
Purpose: Transform L2 AST to Python program string
Signature: l2ToPython(l2AST)
Type: [EXP | Program] => Result<string>
*/
export const l2ToPython = (exp: Exp | Program): Result<string>  => 
    makeOk(unparse(exp));


export const unparse = (exp: Exp | Program): string =>
    isBoolExp(exp) ? `${valueToString(exp.val)}` :
    isNumExp(exp) ?  `${valueToString(exp.val)}` :
    isVarRef(exp) ? `${exp.var}` :
    isProcExp(exp) ?  unparseProcExp(exp) :
    isIfExp(exp) ? `(${unparse(exp.then)} if ${unparse(exp.test)} else ${unparse(exp.alt)})` :
    isAppExp(exp) ? unparseAppExp(exp) :
    isPrimOp(exp) ?  `${exp.op}` :
    isDefineExp(exp) ?  unparseDefineExp(exp):
    isProgram(exp) ?  unparseLExps(exp.exps):
    "never";

//self testing
console.log(bind(bind(p(`(define b (> 3 4))`),parseL3Exp),l2ToPython))
