<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('imdbratings', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('titel', 80)->default('');
            $table->integer('jaar');
            $table->string('imdburl', 80)->default('');
            $table->decimal('imdbrating', 3,1)->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('imdbratings');
    }
};
