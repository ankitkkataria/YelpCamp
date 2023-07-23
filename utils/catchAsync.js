module.exports = func => {
    return (req, res, next) => {
        func(req, res, next).catch(next); // According to express documentation this is equivalent to func(req,res,next).catch(e => next(e)); 
    }
}