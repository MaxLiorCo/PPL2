import { Exp, isAppExp, isBoolExp, isDefineExp, isIfExp, isLetExp, isNumExp, isPrimOp, isProcExp, isProgram, isStrExp, isVarRef, ProcExp, Program, VarDecl } from '../imp/L3-ast';
import { closureToString, compoundSExpToString, isClosure, isCompoundSExp, isEmptySExp, isSymbolSExp, Value } from '../imp/L3-value';
import { Result, makeFailure, makeOk } from '../shared/result';
import { isNumber } from '../shared/type-predicates';
import { map } from "ramda";

const unparseLExps = (les: Exp[]): string =>
    map(l2ToPython, les).join(" ");

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

const unparseProcExp = (pe: ProcExp): string => 
    `(lambda ${map((p: VarDecl) => p.var, pe.args).join(", ")} : ${unparseLExps(pe.body)})`

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
    isProcExp(exp) ?  unparseProcExp(exp) :
    isIfExp(exp) ? `(${l2ToPython(exp.then)} if ${l2ToPython(exp.test)} else ${l2ToPython(exp.alt)})` :
    isAppExp(exp) ?  `(${l2ToPython(exp.rator)} ${unparseLExps(exp.rands)})`:
    isPrimOp(exp) ?  `${exp.op}` :
    isDefineExp(exp) ?  `(define ${exp.var.var} ${l2ToPython(exp.val)})` :
    isProgram(exp) ?  `(L3 ${unparseLExps(exp.exps)})` :
    "never";