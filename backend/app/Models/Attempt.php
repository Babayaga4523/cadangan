<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Attempt extends Model
{
    protected $table = 'attempts';
    public $incrementing = false;
    protected $keyType = 'string';
    
    protected $fillable = [
        'id',
        'user_id',
        'test_id',
        'status',
        'score',
        'started_at',
        'finished_at'
    ];
    
    protected $dates = ['finished_at', 'started_at', 'completed_at'];

    protected $casts = [
        'finished_at' => 'datetime',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    // completed_at now exists in schema and is casted; no accessor needed

    public function answers(): HasMany
    {
        return $this->hasMany(AttemptAnswer::class);
    }

    public function test(): BelongsTo
    {
        return $this->belongsTo(CBTTest::class, 'test_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
