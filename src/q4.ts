import { Exp, isAppExp, isBoolExp, isDefineExp, isIfExp, isLetExp, isNumExp, isPrimOp, isProcExp, isProgram, isStrExp, isVarRef, ProcExp, Program, VarDecl } from '../imp/L3-ast';
import { Value } from '../imp/L3-value';
import { Result, makeFailure, makeOk } from '../shared/result';
import * as T from '../shared/type-predicates';
import { map } from "ramda";

const unparseLExps = (les: Exp[]): string =>
    map(l2ToPython, les).join(" ");

// export const valueToString = (val: Value): string =>
//     T.isNumber(val) ?  val.toString() :
//     val === true ? 'true' :
//     val === false ? 'false' :
//     T.isString(val) ? `"${val}"` :
//     T.isClosure(val) ? closureToString(val) :
//     isPrimOp(val) ? val.op :
//     isSymbolSExp(val) ? val.val :
//     isEmptySExp(val) ? " " :
//     isCompoundSExp(val) ? compoundSExpToString(val) :
//     val;

const unparseProcExp = (pe: ProcExp): string => 
    `(lambda ${map((p: VarDecl) => p.var, pe.args).join(", ")} : ${unparseLExps(pe.body)})`

/*
Purpose: Transform L2 AST to Python program string
Signature: l2ToPython(l2AST)
Type: [EXP | Program] => Result<string>
*/
export const l2ToPython = (exp: Exp | Program): Result<string>  => 
    isBoolExp(exp) ? makeOk(`${valueToString(exp.val)}`) :
    isNumExp(exp) ?  makeOk(`${valueToString(exp.val)}`) :
    //isStrExp(exp) ?  makeOk(valueToString(exp.val)) :
    isVarRef(exp) ? makeOk(`${exp.var}`) :
    isProcExp(exp) ?  makeOk(unparseProcExp(exp)) :
    isIfExp(exp) ?  makeOk(`(if ${l2ToPython(exp.test)} ${l2ToPython(exp.then)} ${l2ToPython(exp.alt)})`) :
    isAppExp(exp) ?  makeOk(`(${l2ToPython(exp.rator)} ${unparseLExps(exp.rands)})`) :
    isPrimOp(exp) ?  makeOk(`${exp.op}`) :
    isDefineExp(exp) ?  makeOk(`(define ${exp.var.var} ${l2ToPython(exp.val)})`) :
    isProgram(exp) ?  makeOk(`(L3 ${unparseLExps(exp.exps)})`) :
    makeFailure("never");
    //makeFailure("TODO")
