import { isDefineExp,  isExp,  isProgram,  makePrimOp, makeVarDecl, makeVarRef, VarDecl, makeIfExp, makeProcExp, IfExp, ClassExp, ProcExp, Exp, Program, Binding, isClassExp, BoolExp, makeBoolExp, makeAppExp, makeStrExp, makeDefineExp, makeProgram, isCExp, isAppExp, isAtomicExp, isIfExp, isLetExp, isLitExp, isProcExp, makeLetExp, CExp } from "./L31-ast";
import { Result, makeOk } from "../shared/result";
import { first, isEmpty } from "../shared/list";
import { is, map } from "ramda"

/*
Purpose: Transform ClassExp to ProcExp
Signature: for2proc(classExp)
Type: ClassExp => ProcExp
*/

export const class2proc = (exp: ClassExp): ProcExp => {
    const args: VarDecl[] = exp.fields;
    return makeProcExp(args, [makeProcExp([makeVarDecl("msg")], [recurIfExp(exp.methods)])]);

}

/*
Recursively building the "ifExp".
*/
const recurIfExp = (bindings: Binding[]): IfExp | BoolExp => {
    return  isEmpty(bindings) ? makeBoolExp(false) :
            makeIfExp(makeAppExp(makePrimOp("eq?"), [makeVarRef("msg"), makeVarRef(`'${bindings[0].var.var}`)]),
                      makeAppExp(first(bindings).val, []),
                      recurIfExp(bindings.slice(1)));
}
    

/*
Purpose: Transform L31 AST to L3 AST
Signature: l31ToL3(l31AST)
Type: [Exp | Program] => Result<Exp | Program>
*/
export const L31ToL3 = (exp: Exp | Program): Result<Exp | Program> => 
    makeOk(rewriteAllClass(exp))
            
    // isClassExp(exp) ? makeOk(class2proc(exp)) :
    // isExp(exp) && !isProgram(exp) ? makeOk(exp) :
    // isProgram(exp) ? makeOk(recProgExp(exp)) : makeOk(makeStrExp("never"));

    
/*
This function traversing the array of expressions of the given program.
Via map ("ramda") we check whether the expression is "define" and if so, we check if its "val" is of type classExp.
If it is, we use "class2proc" to transfrom the "classExp" to a valid expression of L3.
If it isn't, thus it is a valid expression of L3 also, thus we use the same expression without change.
*/
// export const recProgExp = (exp: Program): Program => {
//     const newL3Exps = map(expression => isDefineExp(expression) ? 
//                                             isClassExp(expression.val) ? 
//                                                 makeDefineExp((expression.var), class2proc(expression.val)) :
//                                                 expression :
//                                         expression , exp.exps);
//     return makeProgram(newL3Exps);
//}

export const rewriteAllClass = (exp: Exp | Program): Exp | Program =>
    isExp(exp) ? rewriteAllClassExp(exp) :
    isProgram(exp) ? makeProgram(map(rewriteAllClassExp, exp.exps)) :
    exp;



export const rewriteAllClassExp = (exp : Exp): Exp =>
    isCExp(exp) ? rewriteAllClassCExp(exp) :
    isDefineExp(exp) ? makeDefineExp(exp.var,
                                    rewriteAllClassCExp(exp.val)) :
    exp; 

export const rewriteAllClassCExp = (exp: CExp): CExp =>
    isAtomicExp(exp) ? exp :
    isLitExp(exp) ? exp :
    isIfExp(exp) ? makeIfExp(rewriteAllClassCExp(exp.test),
                                rewriteAllClassCExp(exp.then),
                                rewriteAllClassCExp(exp.alt)) :
    isAppExp(exp) ? makeAppExp(rewriteAllClassCExp(exp.rator),
                                map(rewriteAllClassCExp, exp.rands)) :
    isProcExp(exp) ? makeProcExp(exp.args,
                        map(rewriteAllClassCExp, exp.body)) :
    isLetExp(exp) ? makeLetExp(exp.bindings, exp.body) :
    isClassExp(exp) ? rewriteAllClassCExp(class2proc(exp)) :
    exp;
       
