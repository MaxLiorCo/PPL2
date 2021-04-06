import { CExp, parseL3Exp, Exp, isAppExp, isBoolExp, isDefineExp, isIfExp, isLetExp, isNumExp, isPrimOp, isProcExp, isProgram, isStrExp, isVarRef, ProcExp, Program, VarDecl, DefineExp, isAtomicExp, AppExp } from '../imp/L3-ast';
import { closureToString, compoundSExpToString, isClosure, isCompoundSExp, isEmptySExp, isSymbolSExp, Value } from '../imp/L3-value';
import { bind, Result, makeFailure, makeOk } from '../shared/result';
import { isNumber } from '../shared/type-predicates';
import { is, map } from "ramda";
import {parse as p} from '../shared/parser'

const unparseLExps = (les: Exp[]): string =>
    map(unparse, les).join("\n");

export const valueToString = (val: Value): string =>
    isNumber(val) ?  val.toString() :
    val === true ? 'true' :
    val === false ? 'false' :
    //T.isString(val) ? `"${val}"` :
    //isClosure(val) ? closureToString(val) :
    isPrimOp(val) ? val.op :
    isSymbolSExp(val) ? val.val :
    isEmptySExp(val) ? " " :
    isCompoundSExp(val) ? compoundSExpToString(val) :
    "never";

export const unparsePrimOp = (op: CExp, exps: Exp[]): string => {
    //console.log(op);
    if (isPrimOp(op)) {
        if (["+", "-", "/", "*", "<", ">" , "=", "eq?"].includes(op.op)) {
            return map(unparse, exps).join(` ${op.op === ("=" || "eq?") ? `==` : op.op} `);
        }
        return  op.op === "number?" ? `lambda ${map(unparse, exps)} : (type(${map(unparse, exps)}) == number)` :
                op.op === "boolean?" ? `lambda ${map(unparse, exps)} : (type(${map(unparse, exps)}) == bool)` : 
                op.op === "and" ? `` : ""

    }


    return "nnn";

}

export const unparseAppExp = (ae: AppExp): string =>
    isPrimOp(ae.rator) ? `(${unparsePrimOp(ae.rator, ae.rands)})` :
    isProcExp(ae.rator) ? `${unparseProcExp(ae.rator)}(${map(unparse, ae.rands).join(",")})`:
    "never";

const unparseProcExp = (pe: ProcExp): string => 
    `lambda ${map((p: VarDecl) => p.var, pe.args).join(",")} : ${unparseLExps(pe.body)}`

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
    //isStrExp(exp) ?  makeOk(valueToString(exp.val)) :
    isVarRef(exp) ? `${exp.var}` :
    isProcExp(exp) ?  `(${unparseProcExp(exp)})` :
    isIfExp(exp) ? `(${unparse(exp.then)} if ${unparse(exp.test)} else ${unparse(exp.alt)})` :
    //isAppExp(exp) ?  `(${unparse(exp.rator)} ${unparseLExps(exp.rands)})`:
<<<<<<< HEAD
    isAppExp(exp) ? `(${unparseAppExp(exp)})` :
=======
    isAppExp(exp) ? `${unparseAppExp(exp)}` :
>>>>>>> 289d576dc165f28e57f6085cfeefdd3b7336b62e
    isPrimOp(exp) ?  `${exp.op}` :
    isDefineExp(exp) ?  unparseDefineExp(exp):
    isProgram(exp) ?  unparseLExps(exp.exps):
    "never";

//self testing
console.log(bind(bind(p(`(define b (> 3 4))`),parseL3Exp),l2ToPython))
